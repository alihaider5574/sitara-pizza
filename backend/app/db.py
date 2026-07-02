"""Database connection layer.

Supports two backends — use whichever you have:
  • Neon / direct Postgres  → DATABASE_URL in .env   (asyncpg + SQLAlchemy)
  • Supabase                → SUPABASE_URL + SERVICE_ROLE_KEY in .env

Both can be active at once. Neon is used for all SQL queries; Supabase
is used for auth, storage, and realtime subscriptions if configured.
"""

from functools import lru_cache
from app.config import get_settings

# ─── SQLAlchemy async engine (Neon / Postgres) ────────────────────────────────

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

_engine = None
_session_factory = None


class Base(DeclarativeBase):
    pass


def _build_engine():
    settings = get_settings()
    if not settings.has_neon:
        return None, None

    # Strip channel_binding param — asyncpg doesn't support it
    url = settings.async_database_url
    if "channel_binding" in url:
        parts = url.split("?")
        if len(parts) == 2:
            params = [p for p in parts[1].split("&") if not p.startswith("channel_binding")]
            url = parts[0] + ("?" + "&".join(params) if params else "")

    engine = create_async_engine(
        url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        echo=get_settings().app_env == "development",
    )
    session_factory = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    return engine, session_factory


def get_engine():
    global _engine, _session_factory
    if _engine is None:
        _engine, _session_factory = _build_engine()
    return _engine


def get_session_factory():
    global _engine, _session_factory
    if _session_factory is None:
        _engine, _session_factory = _build_engine()
    return _session_factory


async def get_db() -> AsyncSession:
    """FastAPI dependency — yields an async DB session."""
    factory = get_session_factory()
    if factory is None:
        raise RuntimeError("DATABASE_URL is not configured. Set it in backend/.env")
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ─── Raw asyncpg pool (for simple queries without ORM) ───────────────────────

import asyncpg
import asyncio

_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    """Return a shared asyncpg connection pool (lazy initialisation)."""
    global _pool
    if _pool is None:
        settings = get_settings()
        if not settings.has_neon:
            raise RuntimeError("DATABASE_URL is not configured.")

        # Build a clean DSN for asyncpg (no channel_binding)
        dsn = settings.database_url
        if "channel_binding" in dsn:
            parts = dsn.split("?")
            params = [p for p in parts[1].split("&") if not p.startswith("channel_binding")]
            dsn = parts[0] + ("?" + "&".join(params) if params else "")

        _pool = await asyncpg.create_pool(
            dsn=dsn,
            min_size=2,
            max_size=10,
            ssl="require",
        )
    return _pool


# ─── Supabase client (optional — auth / realtime / storage) ──────────────────

_supabase_client = None


@lru_cache()
def get_supabase():
    """Return a Supabase service-role client if configured, else None."""
    settings = get_settings()
    if not settings.has_supabase:
        return None
    from supabase import create_client
    return create_client(settings.supabase_url, settings.supabase_service_role_key)

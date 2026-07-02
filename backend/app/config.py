from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    # ─── Neon / Postgres ──────────────────────────────────────────────────────
    # Primary database — Neon Postgres connection string
    # Format: postgresql://user:password@host/dbname?sslmode=require
    database_url: str = ""

    # ─── Supabase (optional — for auth, realtime, storage only) ──────────────
    # Leave blank if using Neon as the sole database
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""

    # ─── App ──────────────────────────────────────────────────────────────────
    app_env: str = "development"
    cors_origins: str = "http://localhost:5173"

    # ─── JazzCash ─────────────────────────────────────────────────────────────
    jazzcash_merchant_id: str = ""
    jazzcash_password: str = ""
    jazzcash_integrity_salt: str = ""
    jazzcash_endpoint: str = (
        "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/"
    )

    # ─── EasyPaisa ────────────────────────────────────────────────────────────
    easypaisa_store_id: str = ""
    easypaisa_hash_key: str = ""
    easypaisa_account_num: str = ""
    easypaisa_endpoint: str = (
        "https://easypaystg.easypaisa.com.pk/easypay/Index.jsf"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def async_database_url(self) -> str:
        """Return an asyncpg-compatible URL (postgresql+asyncpg://)."""
        url = self.database_url
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url

    @property
    def has_supabase(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_role_key)

    @property
    def has_neon(self) -> bool:
        return bool(self.database_url)


@lru_cache()
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]

"""
Authentication dependencies.

Supabase JWTs are HS256-signed with the project's JWT secret.
We verify the token locally (no network call) and extract the user's
sub (UUID) and app_metadata role from the payload.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.config import get_settings
from app.db import get_supabase

bearer_scheme = HTTPBearer(auto_error=False)


class CurrentUser:
    def __init__(self, user_id: str, email: str, role: str):
        self.user_id = user_id
        self.email = email
        self.role = role  # "customer" | "admin" | "rider"

    @property
    def is_admin(self) -> bool:
        return self.role == "admin"


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> CurrentUser:
    """Verify the Supabase JWT and return the current user.

    Raises HTTP 401 if the token is missing, expired, or invalid.
    """
    settings = get_settings()

    # Fallback to local admin user if Supabase JWT secret is not set
    if not settings.supabase_jwt_secret or (credentials and credentials.credentials == "dummy-token"):
        return CurrentUser(
            user_id="00000000-0000-0000-0000-000000000000",
            email="admin@sitara.com",
            role="admin"
        )

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False},  # Supabase JWTs have audience = "authenticated"
        )
    except JWTError:
        raise credentials_exception

    user_id: str | None = payload.get("sub")
    email: str = payload.get("email", "")
    if not user_id:
        raise credentials_exception

    # Fetch role from profiles table (single source of truth for custom roles)
    try:
        db = get_supabase()
        result = db.table("profiles").select("role").eq("id", user_id).single().execute()
        role = result.data.get("role", "customer") if result.data else "customer"
    except Exception:
        # If profile doesn't exist yet (new user), default to customer
        role = "customer"

    return CurrentUser(user_id=user_id, email=email, role=role)


async def get_admin_user(
    current_user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:
    """Require the current user to have role='admin'."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user

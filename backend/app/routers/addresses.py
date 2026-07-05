"""User address management endpoints."""

from fastapi import APIRouter, HTTPException, Depends
import asyncpg
import uuid
from pydantic import BaseModel, Field
from typing import Optional

from app.db import get_pool
from app.deps import get_current_user, CurrentUser

router = APIRouter(prefix="/api/addresses", tags=["addresses"])


class CreateAddressRequest(BaseModel):
    address_line: str = Field(..., min_length=5)
    city: str = Field(..., min_length=2)
    label: Optional[str] = None


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1)
    phone: Optional[str] = None


@router.post("", response_model=dict)
async def create_address(
    request: CreateAddressRequest,
    current_user: CurrentUser = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_pool),
):
    """Save a delivery address and return its ID."""
    addr_id = str(uuid.uuid4())
    await pool.execute(
        """
        INSERT INTO addresses (id, user_id, label, address_line, city)
        VALUES ($1, $2, $3, $4, $5)
        """,
        addr_id, current_user.user_id,
        request.label or None, request.address_line, request.city,
    )
    return {"id": addr_id, "address_line": request.address_line, "city": request.city, "label": request.label}


@router.get("/me", response_model=list[dict])
async def list_my_addresses(
    current_user: CurrentUser = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_pool),
):
    """Return addresses for the current user."""
    rows = await pool.fetch(
        "SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at DESC",
        current_user.user_id,
    )
    return [dict(r) for r in rows]


@router.delete("/{address_id}", response_model=dict)
async def delete_address(
    address_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_pool),
):
    """Delete a user address."""
    row = await pool.fetchrow(
        "DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id",
        address_id, current_user.user_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Address not found")
    return {"deleted": address_id}


# ─── Profile endpoints ───────────────────────────────────────────────────────

@router.get("/profile/me", response_model=dict)
async def get_my_profile(
    current_user: CurrentUser = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_pool),
):
    """Return the current user's profile."""
    row = await pool.fetchrow(
        "SELECT id, email, full_name, phone, role, avatar_url, created_at FROM profiles WHERE id = $1",
        current_user.user_id,
    )
    if not row:
        # Auto-create profile if it doesn't exist
        await pool.execute(
            "INSERT INTO profiles (id, email, full_name, phone) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING",
            current_user.user_id, current_user.email, None, None,
        )
        return {
            "id": current_user.user_id,
            "email": current_user.email,
            "full_name": None,
            "phone": None,
            "role": "customer",
            "avatar_url": None,
        }
    return dict(row)


@router.patch("/profile/me", response_model=dict)
async def update_my_profile(
    request: UpdateProfileRequest,
    current_user: CurrentUser = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_pool),
):
    """Update the current user's profile (name, phone)."""
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_clause = []
    params = [current_user.user_id]
    idx = 2
    for k, v in updates.items():
        set_clause.append(f"{k} = ${idx}")
        params.append(v)
        idx += 1

    query = f"UPDATE profiles SET {', '.join(set_clause)} WHERE id = $1 RETURNING id, email, full_name, phone, role, avatar_url"
    row = await pool.fetchrow(query, *params)
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")
    return dict(row)

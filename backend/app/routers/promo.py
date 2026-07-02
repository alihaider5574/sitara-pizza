from fastapi import APIRouter, HTTPException, Depends
import asyncpg
from app.db import get_pool
from app.models.promo import ValidatePromoRequest, ValidatePromoResponse
from datetime import datetime, timezone

router = APIRouter(prefix="/api/promo", tags=["promo"])


@router.post("/validate", response_model=ValidatePromoResponse)
async def validate_promo(
    request: ValidatePromoRequest,
    pool: asyncpg.Pool = Depends(get_pool),
):
    """Validate a promo code against the given subtotal."""
    promo = await pool.fetchrow(
        "SELECT * FROM promo_codes WHERE code = $1 AND active = TRUE",
        request.code.upper()
    )

    if not promo:
        return ValidatePromoResponse(valid=False, discount=0.0, message="Promo code not found or inactive")

    # Check expiry
    expires_at = promo.get("expires_at")
    if expires_at:
        # expires_at is already a datetime object returned by asyncpg from TIMESTAMPTZ
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            return ValidatePromoResponse(valid=False, discount=0.0, message="Promo code has expired")

    # Check minimum order
    min_amount = float(promo.get("min_order_amount") or 0)
    if request.subtotal < min_amount:
        return ValidatePromoResponse(
            valid=False,
            discount=0.0,
            message=f"Minimum order of PKR {min_amount:.0f} required for this promo",
        )

    # Calculate discount
    discount = 0.0
    if promo.get("discount_percent"):
        discount = round(request.subtotal * float(promo["discount_percent"]) / 100, 2)
        message = f"{promo['discount_percent']}% off applied!"
    elif promo.get("discount_flat"):
        discount = min(float(promo["discount_flat"]), request.subtotal)
        message = f"PKR {discount:.0f} off applied!"
    else:
        return ValidatePromoResponse(valid=False, discount=0.0, message="Invalid promo configuration")

    return ValidatePromoResponse(valid=True, discount=discount, message=message)

from fastapi import APIRouter, HTTPException
from app.db import get_supabase
from app.models.promo import ValidatePromoRequest, ValidatePromoResponse
from datetime import datetime, timezone

router = APIRouter(prefix="/api/promo", tags=["promo"])


@router.post("/validate", response_model=ValidatePromoResponse)
async def validate_promo(request: ValidatePromoRequest):
    """Validate a promo code against the given subtotal."""
    db = get_supabase()
    result = (
        db.table("promo_codes")
        .select("*")
        .eq("code", request.code.upper())
        .eq("active", True)
        .single()
        .execute()
    )

    if not result.data:
        return ValidatePromoResponse(valid=False, discount=0.0, message="Promo code not found or inactive")

    promo = result.data

    # Check expiry
    expires_at = promo.get("expires_at")
    if expires_at:
        exp_dt = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
        if exp_dt < datetime.now(timezone.utc):
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

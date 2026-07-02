from fastapi import APIRouter, HTTPException, Depends
import asyncpg
from app.db import get_pool
from app.models.order import CartPriceRequest, CartPriceResponse
from app.services.pricing import calculate_cart_total
from datetime import datetime, timezone

router = APIRouter(prefix="/api/cart", tags=["cart"])


@router.post("/price", response_model=CartPriceResponse)
async def calculate_price(
    request: CartPriceRequest,
    pool: asyncpg.Pool = Depends(get_pool),
):
    """Server-side cart price recalculation.

    Fetches all prices from Neon Postgres — client prices are IGNORED.
    """
    promo_discount = 0.0
    promo_applied = False
    promo_message: str | None = None

    if request.promo_code:
        row = await pool.fetchrow(
            """
            SELECT * FROM promo_codes
            WHERE code = $1 AND active = TRUE
            """,
            request.promo_code.upper(),
        )
        if row:
            expires_at = row["expires_at"]
            if expires_at and expires_at < datetime.now(timezone.utc):
                promo_message = "Promo code has expired"
            else:
                promo_applied = True

    try:
        response = await calculate_cart_total(
            items=request.items,
            promo_discount=promo_discount,
            promo_applied=promo_applied,
            promo_message=promo_message,
            pool=pool,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return response

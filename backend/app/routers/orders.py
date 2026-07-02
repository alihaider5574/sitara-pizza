from fastapi import APIRouter, HTTPException, Depends
import asyncpg
import uuid
from app.db import get_pool
from app.deps import get_current_user, CurrentUser
from app.models.order import CreateOrderRequest
from app.services.pricing import calculate_cart_total, get_item_unit_price_and_addons
from app.services.notifications import on_order_confirmed
import json

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=dict)
async def create_order(
    request: CreateOrderRequest,
    current_user: CurrentUser = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_pool),
):
    """Create a new order — prices are always recalculated server-side."""

    # Verify address belongs to this user
    addr = await pool.fetchrow(
        "SELECT id FROM addresses WHERE id = $1 AND user_id = $2",
        str(request.address_id), current_user.user_id,
    )
    if not addr:
        raise HTTPException(status_code=400, detail="Address not found or does not belong to you")

    # Resolve promo discount
    promo_discount = 0.0
    promo_applied = False
    promo_row = None

    if request.promo_code:
        promo_row = await pool.fetchrow(
            "SELECT * FROM promo_codes WHERE code = $1 AND active = TRUE",
            request.promo_code.upper(),
        )
        if promo_row:
            promo_applied = True

    # Initial price calc (no discount yet — need subtotal first)
    try:
        price = await calculate_cart_total(
            items=request.items,
            promo_discount=0.0,
            promo_applied=False,
            pool=pool,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Apply promo against known subtotal
    if promo_applied and promo_row:
        min_amount = float(promo_row.get("min_order_amount") or 0)
        if price.subtotal >= min_amount:
            if promo_row["discount_percent"]:
                promo_discount = round(price.subtotal * float(promo_row["discount_percent"]) / 100, 2)
            elif promo_row["discount_flat"]:
                promo_discount = min(float(promo_row["discount_flat"]), price.subtotal)
        else:
            promo_applied = False

    # Recalculate with discount
    if promo_discount > 0:
        price = await calculate_cart_total(
            items=request.items,
            promo_discount=promo_discount,
            promo_applied=promo_applied,
            pool=pool,
        )

    order_id = str(uuid.uuid4())

    async with pool.acquire() as conn:
        async with conn.transaction():
            # Insert order
            await conn.execute(
                """
                INSERT INTO orders (id, user_id, status, subtotal, discount,
                    delivery_fee, total, address_id, promo_code, payment_method, payment_status)
                VALUES ($1,$2,'pending',$3,$4,$5,$6,$7,$8,$9,'unpaid')
                """,
                order_id, current_user.user_id,
                price.subtotal, price.discount, price.delivery_fee, price.total,
                str(request.address_id),
                request.promo_code.upper() if request.promo_code else None,
                request.payment_method,
            )

            # Insert order items
            for item in request.items:
                unit_price, addon_snapshots = await get_item_unit_price_and_addons(item, pool=pool)
                await conn.execute(
                    """
                    INSERT INTO order_items (id, order_id, menu_item_id, variant_id,
                        quantity, unit_price, addons, notes)
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
                    """,
                    str(uuid.uuid4()), order_id,
                    str(item.menu_item_id),
                    str(item.variant_id) if item.variant_id else None,
                    item.quantity,
                    unit_price,
                    json.dumps([a.model_dump() for a in addon_snapshots]),
                    item.notes,
                )

    await on_order_confirmed(order_id, current_user.email, price.total)

    return {"order_id": order_id, "total": price.total, "status": "pending"}


@router.get("/me", response_model=list[dict])
async def get_my_orders(
    current_user: CurrentUser = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_pool),
):
    """Return current user's order history, newest first."""
    rows = await pool.fetch(
        """
        SELECT o.*, json_agg(oi.*) AS order_items
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE o.user_id = $1
        GROUP BY o.id
        ORDER BY o.created_at DESC
        """,
        current_user.user_id,
    )
    return [dict(r) for r in rows]


@router.get("/{order_id}", response_model=dict)
async def get_order(
    order_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_pool),
):
    """Return a single order with items."""
    row = await pool.fetchrow(
        """
        SELECT o.*, json_agg(oi.*) AS order_items
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE o.id = $1
        GROUP BY o.id
        """,
        order_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Order not found")

    order = dict(row)
    if order["user_id"] != current_user.user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Access denied")

    return order

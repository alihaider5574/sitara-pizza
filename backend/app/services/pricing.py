"""Server-side pricing calculation using Neon / direct Postgres.

The client NEVER determines the final price. We fetch all prices
directly from the database and compute the total server-side.
"""

from __future__ import annotations
import asyncpg
from app.db import get_pool
from app.models.order import CartItem, CartPriceResponse, AddonSnapshot


DELIVERY_FEE = 99.0  # PKR — flat fee


async def calculate_cart_total(
    items: list[CartItem],
    promo_discount: float = 0.0,
    promo_applied: bool = False,
    promo_message: str | None = None,
    pool: asyncpg.Pool | None = None,
) -> CartPriceResponse:
    """Calculate the cart total from database prices.

    Raises ValueError if any item/variant/addon is not found or unavailable.
    """
    if pool is None:
        pool = await get_pool()

    subtotal = 0.0

    for item in items:
        # Fetch menu item base price
        row = await pool.fetchrow(
            "SELECT base_price, is_available FROM menu_items WHERE id = $1",
            str(item.menu_item_id),
        )
        if not row:
            raise ValueError(f"Menu item {item.menu_item_id} not found")
        if not row["is_available"]:
            raise ValueError(f"Menu item {item.menu_item_id} is currently unavailable")

        unit_price = float(row["base_price"])

        # Add variant price delta
        if item.variant_id:
            vrow = await pool.fetchrow(
                "SELECT price_delta FROM item_variants WHERE id = $1 AND menu_item_id = $2",
                str(item.variant_id), str(item.menu_item_id),
            )
            if not vrow:
                raise ValueError(f"Variant {item.variant_id} not found for this item")
            unit_price += float(vrow["price_delta"])

        # Add addon prices
        for addon_id in item.addon_ids:
            arow = await pool.fetchrow(
                "SELECT price FROM addons WHERE id = $1 AND menu_item_id = $2",
                str(addon_id), str(item.menu_item_id),
            )
            if not arow:
                raise ValueError(f"Addon {addon_id} not found for this item")
            unit_price += float(arow["price"])

        subtotal += unit_price * item.quantity

    total = subtotal - promo_discount + DELIVERY_FEE

    return CartPriceResponse(
        subtotal=round(subtotal, 2),
        discount=round(promo_discount, 2),
        delivery_fee=DELIVERY_FEE,
        total=round(total, 2),
        promo_applied=promo_applied,
        promo_message=promo_message,
    )


async def get_item_unit_price_and_addons(
    item: CartItem,
    pool: asyncpg.Pool | None = None,
) -> tuple[float, list[AddonSnapshot]]:
    """Return (unit_price, addon_snapshots) for a single cart item."""
    if pool is None:
        pool = await get_pool()

    row = await pool.fetchrow(
        "SELECT base_price FROM menu_items WHERE id = $1",
        str(item.menu_item_id),
    )
    unit_price = float(row["base_price"])

    if item.variant_id:
        vrow = await pool.fetchrow(
            "SELECT price_delta FROM item_variants WHERE id = $1",
            str(item.variant_id),
        )
        unit_price += float(vrow["price_delta"])

    addon_snapshots: list[AddonSnapshot] = []
    for addon_id in item.addon_ids:
        arow = await pool.fetchrow(
            "SELECT name, price FROM addons WHERE id = $1",
            str(addon_id),
        )
        unit_price += float(arow["price"])
        addon_snapshots.append(AddonSnapshot(name=arow["name"], price=arow["price"]))

    return unit_price, addon_snapshots

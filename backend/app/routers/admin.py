"""Admin-only routes.

All routes here require role='admin' (enforced by get_admin_user dependency).
"""

from fastapi import APIRouter, HTTPException, Depends
import asyncpg
from app.db import get_pool
from app.deps import get_admin_user, CurrentUser
from app.models.menu import CreateMenuItemRequest, UpdateMenuItemRequest
from app.models.order import UpdateOrderStatusRequest
from app.models.promo import CreatePromoRequest
from app.services.notifications import on_order_status_changed
import uuid

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ─── Menu Management ──────────────────────────────────────────────────────────

@router.post("/menu", response_model=dict)
async def create_menu_item(
    request: CreateMenuItemRequest,
    admin: CurrentUser = Depends(get_admin_user),
    pool: asyncpg.Pool = Depends(get_pool),
):
    item_id = str(uuid.uuid4())
    data = request.model_dump()
    await pool.execute(
        """
        INSERT INTO menu_items (id, category_id, name, description, base_price, image_url, is_available, is_spicy, tags)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        """,
        item_id, str(data["category_id"]), data["name"], data["description"],
        data["base_price"], data["image_url"], data["is_available"], data["is_spicy"], data["tags"]
    )
    return {**data, "id": item_id}


@router.patch("/menu/{item_id}", response_model=dict)
async def update_menu_item(
    item_id: str,
    request: UpdateMenuItemRequest,
    admin: CurrentUser = Depends(get_admin_user),
    pool: asyncpg.Pool = Depends(get_pool),
):
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if "category_id" in updates:
        updates["category_id"] = str(updates["category_id"])
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_clause = []
    params = [item_id]
    idx = 2
    for k, v in updates.items():
        set_clause.append(f"{k} = ${idx}")
        params.append(v)
        idx += 1

    query = f"UPDATE menu_items SET {', '.join(set_clause)} WHERE id = $1 RETURNING *"
    row = await pool.fetchrow(query, *params)
    if not row:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return dict(row)


@router.delete("/menu/{item_id}", response_model=dict)
async def delete_menu_item(
    item_id: str,
    admin: CurrentUser = Depends(get_admin_user),
    pool: asyncpg.Pool = Depends(get_pool),
):
    row = await pool.fetchrow("DELETE FROM menu_items WHERE id = $1 RETURNING id", item_id)
    if not row:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"deleted": item_id}


# ─── Order Management ─────────────────────────────────────────────────────────

@router.get("/orders", response_model=list[dict])
async def list_all_orders(
    status: str | None = None,
    admin: CurrentUser = Depends(get_admin_user),
    pool: asyncpg.Pool = Depends(get_pool),
):
    """Return all orders, optionally filtered by status."""
    import json
    query = """
        SELECT o.*,
               json_agg(
                   json_build_object(
                       'id', oi.id,
                       'menu_item_id', oi.menu_item_id,
                       'item_name', mi.name,
                       'item_image', mi.image_url,
                       'variant_id', oi.variant_id,
                       'quantity', oi.quantity,
                       'unit_price', oi.unit_price,
                       'addons', oi.addons,
                       'notes', oi.notes
                   )
               ) FILTER (WHERE oi.id IS NOT NULL) AS order_items,
               json_build_object(
                   'full_name', p.full_name,
                   'phone', p.phone,
                   'email', p.email
               ) AS profiles,
               json_build_object(
                   'address_line', a.address_line,
                   'city', a.city,
                   'label', a.label
               ) AS delivery_address
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
        LEFT JOIN profiles p ON p.id = o.user_id
        LEFT JOIN addresses a ON a.id = o.address_id
    """
    params = []
    if status:
        query += " WHERE o.status = $1"
        params.append(status)

    query += " GROUP BY o.id, p.full_name, p.phone, p.email, a.address_line, a.city, a.label ORDER BY o.created_at DESC"
    rows = await pool.fetch(query, *params)

    result = []
    for r in rows:
        d = dict(r)

        # Parse profiles JSON if returned as a string
        if isinstance(d.get("profiles"), str):
            try:
                d["profiles"] = json.loads(d["profiles"])
            except Exception:
                d["profiles"] = None
        if d.get("profiles") and not d["profiles"].get("full_name"):
            d["profiles"] = None

        # Parse delivery_address JSON if returned as a string
        if isinstance(d.get("delivery_address"), str):
            try:
                d["delivery_address"] = json.loads(d["delivery_address"])
            except Exception:
                d["delivery_address"] = None

        # Parse order_items JSON if returned as a string
        if isinstance(d.get("order_items"), str):
            try:
                d["order_items"] = json.loads(d["order_items"])
            except Exception:
                d["order_items"] = []
        if d.get("order_items") is None:
            d["order_items"] = []

        result.append(d)
    return result


@router.patch("/orders/{order_id}/status", response_model=dict)
async def update_order_status(
    order_id: str,
    request: UpdateOrderStatusRequest,
    admin: CurrentUser = Depends(get_admin_user),
    pool: asyncpg.Pool = Depends(get_pool),
):
    """Update order status — triggers notifications."""
    row = await pool.fetchrow(
        "UPDATE orders SET status = $2 WHERE id = $1 RETURNING *",
        order_id, request.status
    )
    if not row:
        raise HTTPException(status_code=404, detail="Order not found")

    await on_order_status_changed(order_id, "", request.status)
    return dict(row)


# ─── Analytics ────────────────────────────────────────────────────────────────

@router.get("/analytics/summary", response_model=dict)
async def get_analytics_summary(
    admin: CurrentUser = Depends(get_admin_user),
    pool: asyncpg.Pool = Depends(get_pool),
):
    """Return basic sales analytics for the admin dashboard."""
    total_orders = await pool.fetchval("SELECT COUNT(*) FROM orders")
    total_revenue = await pool.fetchval("SELECT COALESCE(SUM(total), 0) FROM orders WHERE status != 'cancelled'")
    pending = await pool.fetchval("SELECT COUNT(*) FROM orders WHERE status = 'pending'")

    return {
        "total_orders": total_orders,
        "total_revenue": float(total_revenue),
        "pending_orders": pending,
    }


# ─── Promo Management ─────────────────────────────────────────────────────────

@router.post("/promos", response_model=dict)
async def create_promo(
    request: CreatePromoRequest,
    admin: CurrentUser = Depends(get_admin_user),
    pool: asyncpg.Pool = Depends(get_pool),
):
    promo_id = str(uuid.uuid4())
    data = request.model_dump()
    data["code"] = data["code"].upper()
    await pool.execute(
        """
        INSERT INTO promo_codes (id, code, discount_percent, discount_flat, min_order_amount, max_uses, active, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        """,
        promo_id, data["code"], data["discount_percent"], data["discount_flat"],
        data["min_order_amount"], data["max_uses"], data["active"], data["expires_at"]
    )
    return {**data, "id": promo_id}


@router.get("/promos", response_model=list[dict])
async def list_promos(
    admin: CurrentUser = Depends(get_admin_user),
    pool: asyncpg.Pool = Depends(get_pool),
):
    rows = await pool.fetch("SELECT * FROM promo_codes ORDER BY created_at DESC")
    return [dict(r) for r in rows]


# ─── Categories Management ────────────────────────────────────────────────────

@router.post("/categories", response_model=dict)
async def create_category(
    name: str,
    slug: str,
    sort_order: int = 0,
    admin: CurrentUser = Depends(get_admin_user),
    pool: asyncpg.Pool = Depends(get_pool),
):
    cat_id = str(uuid.uuid4())
    await pool.execute(
        "INSERT INTO categories (id, name, slug, sort_order) VALUES ($1, $2, $3, $4)",
        cat_id, name, slug, sort_order
    )
    return {"id": cat_id, "name": name, "slug": slug, "sort_order": sort_order}

"""Admin-only routes.

All routes here require role='admin' (enforced by get_admin_user dependency).
"""

from fastapi import APIRouter, HTTPException, Depends
from app.db import get_supabase
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
):
    db = get_supabase()
    data = request.model_dump()
    data["id"] = str(uuid.uuid4())
    data["category_id"] = str(data["category_id"])
    result = db.table("menu_items").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create menu item")
    return result.data[0]


@router.patch("/menu/{item_id}", response_model=dict)
async def update_menu_item(
    item_id: str,
    request: UpdateMenuItemRequest,
    admin: CurrentUser = Depends(get_admin_user),
):
    db = get_supabase()
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if "category_id" in updates:
        updates["category_id"] = str(updates["category_id"])
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = db.table("menu_items").update(updates).eq("id", item_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return result.data[0]


@router.delete("/menu/{item_id}", response_model=dict)
async def delete_menu_item(
    item_id: str,
    admin: CurrentUser = Depends(get_admin_user),
):
    db = get_supabase()
    result = db.table("menu_items").delete().eq("id", item_id).execute()
    return {"deleted": item_id}


# ─── Order Management ─────────────────────────────────────────────────────────

@router.get("/orders", response_model=list[dict])
async def list_all_orders(
    status: str | None = None,
    admin: CurrentUser = Depends(get_admin_user),
):
    """Return all orders, optionally filtered by status."""
    db = get_supabase()
    query = db.table("orders").select("*, order_items(*), profiles(full_name, phone)")
    if status:
        query = query.eq("status", status)
    result = query.order("created_at", desc=True).execute()
    return result.data or []


@router.patch("/orders/{order_id}/status", response_model=dict)
async def update_order_status(
    order_id: str,
    request: UpdateOrderStatusRequest,
    admin: CurrentUser = Depends(get_admin_user),
):
    """Update order status — triggers Realtime broadcast to the customer's frontend."""
    db = get_supabase()

    # Fetch order to get user email for notification
    order_result = (
        db.table("orders")
        .select("user_id, total")
        .eq("id", order_id)
        .single()
        .execute()
    )
    if not order_result.data:
        raise HTTPException(status_code=404, detail="Order not found")

    result = (
        db.table("orders")
        .update({"status": request.status})
        .eq("id", order_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to update order status")

    # Fire notification (non-blocking)
    await on_order_status_changed(order_id, "", request.status)

    return {"order_id": order_id, "status": request.status}


# ─── Analytics ────────────────────────────────────────────────────────────────

@router.get("/analytics/summary", response_model=dict)
async def get_analytics_summary(admin: CurrentUser = Depends(get_admin_user)):
    """Return basic sales analytics for the admin dashboard."""
    db = get_supabase()

    # Total orders
    total_orders = db.table("orders").select("id", count="exact").execute()
    # Total revenue
    revenue_result = db.table("orders").select("total").neq("status", "cancelled").execute()
    total_revenue = sum(float(o["total"] or 0) for o in (revenue_result.data or []))
    # Pending orders
    pending = db.table("orders").select("id", count="exact").eq("status", "pending").execute()

    return {
        "total_orders": total_orders.count or 0,
        "total_revenue": round(total_revenue, 2),
        "pending_orders": pending.count or 0,
    }


# ─── Promo Management ─────────────────────────────────────────────────────────

@router.post("/promos", response_model=dict)
async def create_promo(
    request: CreatePromoRequest,
    admin: CurrentUser = Depends(get_admin_user),
):
    db = get_supabase()
    data = request.model_dump()
    data["id"] = str(uuid.uuid4())
    data["code"] = data["code"].upper()
    if data.get("expires_at"):
        data["expires_at"] = data["expires_at"].isoformat()
    result = db.table("promo_codes").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create promo code")
    return result.data[0]


@router.get("/promos", response_model=list[dict])
async def list_promos(admin: CurrentUser = Depends(get_admin_user)):
    db = get_supabase()
    result = db.table("promo_codes").select("*").order("created_at", desc=True).execute()
    return result.data or []


# ─── Categories Management ────────────────────────────────────────────────────

@router.post("/categories", response_model=dict)
async def create_category(
    name: str,
    slug: str,
    sort_order: int = 0,
    admin: CurrentUser = Depends(get_admin_user),
):
    db = get_supabase()
    data = {"id": str(uuid.uuid4()), "name": name, "slug": slug, "sort_order": sort_order}
    result = db.table("categories").insert(data).execute()
    return result.data[0]

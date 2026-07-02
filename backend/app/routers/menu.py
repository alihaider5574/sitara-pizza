from fastapi import APIRouter, HTTPException, Query, Depends
import asyncpg
from app.db import get_pool
from app.models.menu import Category, MenuItem, MenuItemDetail

router = APIRouter(prefix="/api", tags=["menu"])


@router.get("/categories", response_model=list[Category])
async def list_categories(pool: asyncpg.Pool = Depends(get_pool)):
    """Return all menu categories sorted by sort_order."""
    rows = await pool.fetch(
        "SELECT id, name, slug, sort_order FROM categories ORDER BY sort_order ASC"
    )
    return [dict(r) for r in rows]


@router.get("/menu", response_model=list[MenuItem])
async def list_menu_items(
    category: str | None = Query(None, description="Filter by category slug"),
    search: str | None = Query(None, description="Search by item name"),
    available_only: bool = Query(True, description="Only return available items"),
    pool: asyncpg.Pool = Depends(get_pool),
):
    """Return menu items with optional category and search filters."""
    conditions = []
    params = []
    idx = 1

    if available_only:
        conditions.append(f"m.is_available = TRUE")

    if category:
        conditions.append(f"c.slug = ${idx}")
        params.append(category)
        idx += 1

    if search:
        conditions.append(f"m.name ILIKE ${idx}")
        params.append(f"%{search}%")
        idx += 1

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    query = f"""
        SELECT m.id, m.category_id, m.name, m.description, m.base_price,
               m.image_url, m.is_available, m.is_spicy, m.tags
        FROM menu_items m
        LEFT JOIN categories c ON m.category_id = c.id
        {where}
        ORDER BY m.created_at ASC
    """
    rows = await pool.fetch(query, *params)
    return [dict(r) for r in rows]


@router.get("/menu/{item_id}", response_model=MenuItemDetail)
async def get_menu_item(item_id: str, pool: asyncpg.Pool = Depends(get_pool)):
    """Return a single menu item with its variants, addons, and category."""
    item_row = await pool.fetchrow(
        "SELECT * FROM menu_items WHERE id = $1", item_id
    )
    if not item_row:
        raise HTTPException(status_code=404, detail="Menu item not found")

    item = dict(item_row)

    variants = await pool.fetch(
        "SELECT * FROM item_variants WHERE menu_item_id = $1 ORDER BY price_delta ASC",
        item_id,
    )
    addons = await pool.fetch(
        "SELECT * FROM addons WHERE menu_item_id = $1 ORDER BY price ASC",
        item_id,
    )
    cat = await pool.fetchrow(
        "SELECT * FROM categories WHERE id = $1", str(item["category_id"])
    )

    return {
        **item,
        "variants": [dict(r) for r in variants],
        "addons": [dict(r) for r in addons],
        "category": dict(cat) if cat else None,
    }

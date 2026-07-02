from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class Category(BaseModel):
    id: UUID
    name: str
    slug: str
    sort_order: int = 0


class Addon(BaseModel):
    id: UUID
    name: str
    price: float
    menu_item_id: UUID


class ItemVariant(BaseModel):
    id: UUID
    menu_item_id: UUID
    name: str
    price_delta: float = 0.0


class MenuItem(BaseModel):
    id: UUID
    category_id: UUID
    name: str
    description: Optional[str] = None
    base_price: float
    image_url: Optional[str] = None
    is_available: bool = True
    is_spicy: bool = False
    tags: list[str] = []


class MenuItemDetail(MenuItem):
    variants: list[ItemVariant] = []
    addons: list[Addon] = []
    category: Optional[Category] = None


class CreateMenuItemRequest(BaseModel):
    category_id: UUID
    name: str = Field(..., min_length=1, max_length=120)
    description: Optional[str] = None
    base_price: float = Field(..., gt=0)
    image_url: Optional[str] = None
    is_available: bool = True
    is_spicy: bool = False
    tags: list[str] = []


class UpdateMenuItemRequest(BaseModel):
    category_id: Optional[UUID] = None
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    description: Optional[str] = None
    base_price: Optional[float] = Field(None, gt=0)
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    is_spicy: Optional[bool] = None
    tags: Optional[list[str]] = None

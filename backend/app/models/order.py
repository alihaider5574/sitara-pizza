from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class AddonSnapshot(BaseModel):
    """Snapshot of a chosen addon stored in order_items.addons JSONB."""
    name: str
    price: float


class CartItem(BaseModel):
    menu_item_id: UUID
    variant_id: Optional[UUID] = None
    quantity: int = Field(..., ge=1)
    addon_ids: list[UUID] = []
    notes: Optional[str] = None


class CartPriceRequest(BaseModel):
    items: list[CartItem]
    promo_code: Optional[str] = None


class CartPriceResponse(BaseModel):
    subtotal: float
    discount: float
    delivery_fee: float
    total: float
    promo_applied: bool
    promo_message: Optional[str] = None


class CreateOrderRequest(BaseModel):
    items: list[CartItem]
    address_id: UUID
    promo_code: Optional[str] = None
    payment_method: str = Field(..., pattern="^(cod|jazzcash|easypaisa)$")
    notes: Optional[str] = None


class OrderItem(BaseModel):
    id: UUID
    menu_item_id: UUID
    variant_id: Optional[UUID] = None
    quantity: int
    unit_price: float
    addons: list[AddonSnapshot] = []
    notes: Optional[str] = None


class Order(BaseModel):
    id: UUID
    user_id: UUID
    status: str  # pending | confirmed | preparing | out_for_delivery | delivered | cancelled
    subtotal: float
    discount: float
    delivery_fee: float
    total: float
    address_id: UUID
    promo_code: Optional[str] = None
    payment_method: str
    payment_status: str
    created_at: datetime
    updated_at: datetime
    items: list[OrderItem] = []


class UpdateOrderStatusRequest(BaseModel):
    status: str = Field(
        ...,
        pattern="^(pending|confirmed|preparing|out_for_delivery|delivered|cancelled)$"
    )

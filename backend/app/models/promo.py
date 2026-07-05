from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class PromoCode(BaseModel):
    id: UUID
    code: str
    discount_percent: Optional[float] = None
    discount_flat: Optional[float] = None
    min_order_amount: float = 0.0
    expires_at: Optional[datetime] = None
    active: bool = True


class ValidatePromoRequest(BaseModel):
    code: str = Field(..., min_length=1)
    subtotal: float = Field(..., gt=0)


class ValidatePromoResponse(BaseModel):
    valid: bool
    discount: float = 0.0
    message: str


class CreatePromoRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=32)
    discount_percent: Optional[float] = Field(None, ge=0, le=100)
    discount_flat: Optional[float] = Field(None, ge=0)
    min_order_amount: float = 0.0
    max_uses: Optional[int] = Field(None, ge=1)
    expires_at: Optional[datetime] = None
    active: bool = True


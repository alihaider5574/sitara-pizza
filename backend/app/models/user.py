from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class Profile(BaseModel):
    id: UUID
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: str = "customer"
    loyalty_points: int = 0


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=120)
    phone: Optional[str] = None


class Address(BaseModel):
    id: UUID
    user_id: UUID
    label: Optional[str] = None  # "Home", "Work"
    address_line: str
    city: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    is_default: bool = False


class CreateAddressRequest(BaseModel):
    label: Optional[str] = None
    address_line: str = Field(..., min_length=5)
    city: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    is_default: bool = False

from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


class AdminOrderItemRead(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    line_total: Decimal

    model_config = {"from_attributes": True}


class AdminOrderRead(BaseModel):
    id: int
    order_no: str
    user_id: int
    user_name: str = ""
    user_email: str = ""
    status: str
    payment_status: str
    shipping_status: str
    total_amount: Decimal
    shipping_address: str
    created_at: datetime
    paid_at: datetime | None
    items: list[AdminOrderItemRead]


class AdminOrderListResponse(BaseModel):
    page: int
    page_size: int
    total: int
    items: list[AdminOrderRead]


class AdminOrderStatusUpdate(BaseModel):
    status: Literal["created", "cancelled", "fulfilled"] = Field(...)


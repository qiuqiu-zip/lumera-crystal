from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models import AdminUser
from app.repositories.shop_repository import ShopRepository
from app.schemas.admin_order import AdminOrderListResponse, AdminOrderRead, AdminOrderStatusUpdate

router = APIRouter(prefix="/orders", tags=["admin-orders"])


def _to_read(item) -> AdminOrderRead:
    return AdminOrderRead(
        id=item.id,
        order_no=item.order_no,
        user_id=item.user_id,
        user_name=item.user.name if item.user else "",
        user_email=item.user.email if item.user else "",
        status=item.status,
        payment_status=item.payment_status,
        shipping_status=item.shipping_status,
        total_amount=item.total_amount,
        shipping_address=item.shipping_address,
        created_at=item.created_at,
        paid_at=item.paid_at,
        items=item.items,
    )


@router.get("", response_model=AdminOrderListResponse)
def list_orders(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: str | None = None,
    tab: str = Query(default="all"),
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> AdminOrderListResponse:
    repo = ShopRepository(db)
    items, total = repo.list_orders_for_admin(page=page, page_size=page_size, search=search, tab=tab)
    return AdminOrderListResponse(page=page, page_size=page_size, total=total, items=[_to_read(item) for item in items])


@router.get("/{order_id}", response_model=AdminOrderRead)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> AdminOrderRead:
    repo = ShopRepository(db)
    item = repo.get_order(order_id)
    if not item:
        raise HTTPException(status_code=404, detail="订单不存在")
    return _to_read(item)


@router.patch("/{order_id}/status", response_model=AdminOrderRead)
def update_order_status(
    order_id: int,
    payload: AdminOrderStatusUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> AdminOrderRead:
    repo = ShopRepository(db)
    item = repo.get_order(order_id)
    if not item:
        raise HTTPException(status_code=404, detail="订单不存在")

    item.status = payload.status
    if payload.status == "cancelled":
        item.shipping_status = "pending"
    if payload.status == "fulfilled":
        item.shipping_status = "shipped"
    db.add(item)
    db.commit()
    db.refresh(item)
    return _to_read(item)


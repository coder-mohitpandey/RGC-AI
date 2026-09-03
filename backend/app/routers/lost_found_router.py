"""
Lost & Found routes.
  - Admin publishes items that staff/management have physically found.
  - Users search the published list, or file a report describing their own lost item.
"""
import os
import shutil
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import require_role
from ..database import get_db

router = APIRouter(prefix="/lost-found", tags=["lost-found"])

UPLOAD_DIR = "uploads/lost_items"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# ADMIN: publish a found item
# ---------------------------------------------------------------------------
@router.post("/items", response_model=schemas.LostItemOut)
def upload_found_item(
    item_name: str = Form(...),
    description: Optional[str] = Form(None),
    found_location: Optional[str] = Form(None),
    kept_at_station: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_role(models.UserRole.admin)),
):
    image_path = None
    if image and image.filename:
        ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4().hex}{ext}"
        image_path = os.path.join(UPLOAD_DIR, filename)
        with open(image_path, "wb") as f:
            shutil.copyfileobj(image.file, f)

    item = models.LostItem(
        item_name=item_name,
        description=description,
        image_path=image_path,
        found_location=found_location,
        kept_at_station=kept_at_station,
        uploaded_by_admin_id=admin.id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/items/{item_id}/claim", response_model=schemas.LostItemOut)
def mark_item_claimed(
    item_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_role(models.UserRole.admin)),
):
    item = db.query(models.LostItem).filter(models.LostItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.status = models.LostItemStatus.claimed
    db.commit()
    db.refresh(item)
    return item


# ---------------------------------------------------------------------------
# USER: search published found items
# ---------------------------------------------------------------------------
@router.get("/items", response_model=List[schemas.LostItemOut])
def search_found_items(
    q: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.LostItem).filter(models.LostItem.status == models.LostItemStatus.unclaimed)
    if q:
        like = f"%{q}%"
        query = query.filter(models.LostItem.item_name.ilike(like) | models.LostItem.description.ilike(like))
    return query.order_by(models.LostItem.date_found.desc()).all()


# ---------------------------------------------------------------------------
# USER: report a lost item
# ---------------------------------------------------------------------------
@router.post("/reports", response_model=schemas.LostReportOut)
def report_lost_item(
    payload: schemas.LostReportCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.user)),
):
    report = models.LostReport(user_id=current_user.id, **payload.model_dump())
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/reports/mine", response_model=List[schemas.LostReportOut])
def my_lost_reports(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.user)),
):
    return (
        db.query(models.LostReport)
        .filter(models.LostReport.user_id == current_user.id)
        .order_by(models.LostReport.created_at.desc())
        .all()
    )

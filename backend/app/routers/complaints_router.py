"""
Complaint routes covering the full lifecycle:
  user creates -> auto-classified & prioritized -> admin views/assigns -> staff works &
  reports -> admin verifies -> user sees final progress.
"""
import os
import shutil
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user, require_role
from ..database import get_db
from ..utils.classifier import get_priority, get_recommended_staff_type

router = APIRouter(prefix="/complaints", tags=["complaints"])

UPLOAD_DIR = "uploads/complaints"
REPORT_UPLOAD_DIR = "uploads/reports"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(REPORT_UPLOAD_DIR, exist_ok=True)


def _save_file(upload: UploadFile, folder: str) -> tuple[str, str]:
    ext = os.path.splitext(upload.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(folder, filename)
    with open(path, "wb") as f:
        shutil.copyfileobj(upload.file, f)
    media_type = "video" if ext.lower() in [".mp4", ".mov", ".avi", ".mkv"] else "image"
    return path, media_type


# ---------------------------------------------------------------------------
# USER: create complaint
# ---------------------------------------------------------------------------
@router.post("", response_model=schemas.ComplaintOut)
def create_complaint(
    category: models.ComplaintCategory = Form(...),
    description: Optional[str] = Form(None),
    train_no: Optional[str] = Form(None),
    coach_no: Optional[str] = Form(None),
    seat_no: Optional[str] = Form(None),
    location_note: Optional[str] = Form(None),
    files: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.user)),
):
    complaint = models.Complaint(
        user_id=current_user.id,
        category=category,
        priority=get_priority(category),
        description=description,
        train_no=train_no,
        coach_no=coach_no,
        seat_no=seat_no,
        location_note=location_note,
        status=models.ComplaintStatus.pending,
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    for f in files:
        if f and f.filename:
            path, media_type = _save_file(f, UPLOAD_DIR)
            db.add(models.ComplaintMedia(complaint_id=complaint.id, file_path=path, media_type=media_type))
    db.commit()
    db.refresh(complaint)
    return complaint


# ---------------------------------------------------------------------------
# USER: view own complaints / progress
# ---------------------------------------------------------------------------
@router.get("/mine", response_model=List[schemas.ComplaintOut])
def my_complaints(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.user)),
):
    return (
        db.query(models.Complaint)
        .filter(models.Complaint.user_id == current_user.id)
        .order_by(models.Complaint.created_at.desc())
        .all()
    )


# ---------------------------------------------------------------------------
# ADMIN: list all complaints, filterable by priority/category/status
# ---------------------------------------------------------------------------
@router.get("", response_model=List[schemas.ComplaintOut])
def list_complaints(
    priority: Optional[models.Priority] = None,
    category: Optional[models.ComplaintCategory] = None,
    status: Optional[models.ComplaintStatus] = None,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_role(models.UserRole.admin)),
):
    q = db.query(models.Complaint)
    if priority:
        q = q.filter(models.Complaint.priority == priority)
    if category:
        q = q.filter(models.Complaint.category == category)
    if status:
        q = q.filter(models.Complaint.status == status)
    # highest priority first, then newest first
    priority_order = {models.Priority.high: 0, models.Priority.medium: 1, models.Priority.low: 2}
    complaints = q.order_by(models.Complaint.created_at.desc()).all()
    complaints.sort(key=lambda c: priority_order.get(c.priority, 1))
    return complaints


@router.get("/{complaint_id}", response_model=schemas.ComplaintOut)
def get_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    # basic access control: owner, assigned staff, or admin
    if current_user.role == models.UserRole.user and complaint.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your complaint")
    if current_user.role == models.UserRole.staff and complaint.assigned_staff_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not assigned to you")
    return complaint


@router.get("/{complaint_id}/suggested-staff-type")
def suggested_staff_type(
    complaint_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_role(models.UserRole.admin)),
):
    """Helper for the admin UI: recommends which staff_type this complaint should go to."""
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return {"recommended_staff_type": get_recommended_staff_type(complaint.category)}


# ---------------------------------------------------------------------------
# ADMIN: assign complaint to staff
# ---------------------------------------------------------------------------
@router.post("/{complaint_id}/assign", response_model=schemas.ComplaintOut)
def assign_complaint(
    complaint_id: int,
    payload: schemas.ComplaintAssign,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_role(models.UserRole.admin)),
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    staff = db.query(models.User).filter(
        models.User.id == payload.staff_id, models.User.role == models.UserRole.staff
    ).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")

    complaint.assigned_staff_id = staff.id
    complaint.status = models.ComplaintStatus.assigned
    db.commit()
    db.refresh(complaint)
    return complaint


# ---------------------------------------------------------------------------
# STAFF: view assigned complaints
# ---------------------------------------------------------------------------
@router.get("/staff/assigned", response_model=List[schemas.ComplaintOut])
def assigned_to_me(
    db: Session = Depends(get_db),
    staff: models.User = Depends(require_role(models.UserRole.staff)),
):
    return (
        db.query(models.Complaint)
        .filter(models.Complaint.assigned_staff_id == staff.id)
        .order_by(models.Complaint.created_at.desc())
        .all()
    )


@router.post("/{complaint_id}/start")
def mark_in_progress(
    complaint_id: int,
    db: Session = Depends(get_db),
    staff: models.User = Depends(require_role(models.UserRole.staff)),
):
    complaint = db.query(models.Complaint).filter(
        models.Complaint.id == complaint_id, models.Complaint.assigned_staff_id == staff.id
    ).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found or not assigned to you")
    complaint.status = models.ComplaintStatus.in_progress
    db.commit()
    return {"message": "Marked in progress"}


# ---------------------------------------------------------------------------
# STAFF: submit report for a complaint (proof optional)
# ---------------------------------------------------------------------------
@router.post("/{complaint_id}/report", response_model=schemas.ReportOut)
def submit_report(
    complaint_id: int,
    description: str = Form(...),
    files: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    staff: models.User = Depends(require_role(models.UserRole.staff)),
):
    complaint = db.query(models.Complaint).filter(
        models.Complaint.id == complaint_id, models.Complaint.assigned_staff_id == staff.id
    ).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found or not assigned to you")

    report = models.Report(complaint_id=complaint.id, staff_id=staff.id, description=description)
    db.add(report)
    db.commit()
    db.refresh(report)

    for f in files:
        if f and f.filename:
            path, media_type = _save_file(f, REPORT_UPLOAD_DIR)
            db.add(models.ReportMedia(report_id=report.id, file_path=path, media_type=media_type))

    complaint.status = models.ComplaintStatus.resolved  # awaiting admin verification
    db.commit()
    db.refresh(report)
    return report


# ---------------------------------------------------------------------------
# ADMIN: view & verify staff reports
# ---------------------------------------------------------------------------
@router.get("/reports/pending-verification", response_model=List[schemas.ComplaintOut])
def reports_pending_verification(
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_role(models.UserRole.admin)),
):
    return (
        db.query(models.Complaint)
        .filter(models.Complaint.status == models.ComplaintStatus.resolved)
        .order_by(models.Complaint.updated_at.desc())
        .all()
    )


@router.post("/reports/{report_id}/verify", response_model=schemas.ReportOut)
def verify_report(
    report_id: int,
    payload: schemas.ReportVerify,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_role(models.UserRole.admin)),
):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    complaint = db.query(models.Complaint).filter(models.Complaint.id == report.complaint_id).first()

    report.admin_remark = payload.admin_remark
    if payload.approve:
        report.verified = True
        complaint.status = models.ComplaintStatus.verified
    else:
        report.verified = False
        complaint.status = models.ComplaintStatus.rejected  # sent back; staff can resubmit -> reuse /start then /report

    db.commit()
    db.refresh(report)
    return report

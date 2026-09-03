"""
Pydantic schemas for request/response validation.
"""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator

from .models import (ComplaintCategory, ComplaintStatus, LostItemStatus,
                      LostReportStatus, Priority, StaffType, UserRole)


# ---------------- Auth ----------------
class UserSignup(BaseModel):
    username: str
    pnr: Optional[str] = None
    phone: Optional[str] = None
    password: str

    @field_validator("phone")
    @classmethod
    def require_identifier(cls, v, info):
        # at least one of pnr / phone must exist; enforced again in router
        return v


class UserLogin(BaseModel):
    identifier: str  # pnr OR phone
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user_id: int
    username: str


class OTPRequest(BaseModel):
    phone: str


class OTPVerify(BaseModel):
    phone: str
    otp: str


class StaffCreate(BaseModel):
    """Used by admin to create staff accounts."""
    username: str
    phone: str
    password: str
    staff_type: StaffType


class AdminCreate(BaseModel):
    """Used by an existing admin to create another admin account."""
    username: str
    phone: str
    password: str


# ---------------- Complaint ----------------
class ComplaintCreate(BaseModel):
    description: Optional[str] = None
    train_no: Optional[str] = None
    coach_no: Optional[str] = None
    seat_no: Optional[str] = None
    location_note: Optional[str] = None
    # user-picked category from the six defined types
    category: ComplaintCategory


class ComplaintMediaOut(BaseModel):
    id: int
    file_path: str
    media_type: str

    class Config:
        from_attributes = True


class ReportMediaOut(BaseModel):
    id: int
    file_path: str
    media_type: str

    class Config:
        from_attributes = True


class ReportOut(BaseModel):
    id: int
    description: str
    verified: bool
    admin_remark: Optional[str] = None
    created_at: datetime
    media: List[ReportMediaOut] = []

    class Config:
        from_attributes = True


class ComplaintOut(BaseModel):
    id: int
    complaint_number: str
    category: ComplaintCategory
    priority: Priority
    description: Optional[str]
    train_no: Optional[str]
    coach_no: Optional[str]
    seat_no: Optional[str]
    location_note: Optional[str]
    status: ComplaintStatus
    assigned_staff_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    media: List[ComplaintMediaOut] = []
    reports: List[ReportOut] = []

    class Config:
        from_attributes = True


class ComplaintAssign(BaseModel):
    staff_id: int


class ReportCreate(BaseModel):
    description: str


class ReportVerify(BaseModel):
    approve: bool
    admin_remark: Optional[str] = None


# ---------------- Lost & Found ----------------
class LostItemCreate(BaseModel):
    item_name: str
    description: Optional[str] = None
    found_location: Optional[str] = None
    kept_at_station: Optional[str] = None


class LostItemOut(BaseModel):
    id: int
    item_name: str
    description: Optional[str]
    image_path: Optional[str]
    found_location: Optional[str]
    kept_at_station: Optional[str]
    date_found: datetime
    status: LostItemStatus

    class Config:
        from_attributes = True


class LostReportCreate(BaseModel):
    item_name: str
    description: Optional[str] = None
    lost_location: Optional[str] = None
    date_lost: Optional[datetime] = None
    contact_info: Optional[str] = None


class LostReportOut(BaseModel):
    id: int
    item_name: str
    description: Optional[str]
    lost_location: Optional[str]
    date_lost: Optional[datetime]
    contact_info: Optional[str]
    status: LostReportStatus
    created_at: datetime

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: int
    username: str
    pnr: Optional[str]
    phone: Optional[str]
    role: UserRole
    staff_type: Optional[StaffType]

    class Config:
        from_attributes = True

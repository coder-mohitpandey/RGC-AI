"""
SQLAlchemy ORM models for the Railway Complaint Management System.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import (Boolean, Column, DateTime, Enum, ForeignKey, Integer,
                         String, Text)
from sqlalchemy.orm import relationship

from .database import Base


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------
class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"
    staff = "staff"


class StaffType(str, enum.Enum):
    guard = "guard"                # railway guards -> seat disputes, unlawful occupancy, public nuisance
    cleaning_crew = "cleaning_crew"  # hygiene / cleanliness / food related
    management = "management"      # staff complaints, non-urgent complaints


class ComplaintCategory(str, enum.Enum):
    hygiene_cleanliness = "hygiene_cleanliness"
    food_related = "food_related"
    staff_related = "staff_related"
    unknown_passenger = "unknown_passenger"
    public_nuisance = "public_nuisance"
    non_urgent = "non_urgent"


class Priority(str, enum.Enum):
    high = "high"
    medium = "medium"
    low = "low"


class ComplaintStatus(str, enum.Enum):
    pending = "pending"          # just filed, not yet assigned
    assigned = "assigned"        # assigned to staff
    in_progress = "in_progress"  # staff working on it
    resolved = "resolved"        # staff submitted report, awaiting admin verification
    verified = "verified"        # admin verified -> closed & visible to user as done
    rejected = "rejected"        # admin rejected staff's report, sent back


class LostItemStatus(str, enum.Enum):
    unclaimed = "unclaimed"
    claimed = "claimed"


class LostReportStatus(str, enum.Enum):
    pending = "pending"
    matched = "matched"
    closed = "closed"


def gen_complaint_number():
    return "CMP-" + uuid.uuid4().hex[:8].upper()


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), nullable=False)
    pnr = Column(String(20), unique=True, index=True, nullable=True)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.user, nullable=False)
    staff_type = Column(Enum(StaffType), nullable=True)  # only used when role == staff
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    complaints = relationship("Complaint", back_populates="user", foreign_keys="Complaint.user_id")
    assigned_complaints = relationship("Complaint", back_populates="assigned_staff", foreign_keys="Complaint.assigned_staff_id")
    reports = relationship("Report", back_populates="staff")
    lost_reports = relationship("LostReport", back_populates="user")


# ---------------------------------------------------------------------------
# Complaint
# ---------------------------------------------------------------------------
class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_number = Column(String(20), unique=True, index=True, default=gen_complaint_number)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    category = Column(Enum(ComplaintCategory), nullable=False)
    priority = Column(Enum(Priority), nullable=False)
    description = Column(Text, nullable=True)

    train_no = Column(String(20), nullable=True)
    coach_no = Column(String(10), nullable=True)
    seat_no = Column(String(10), nullable=True)
    location_note = Column(String(255), nullable=True)  # e.g. platform number, station name

    status = Column(Enum(ComplaintStatus), default=ComplaintStatus.pending, nullable=False)

    assigned_staff_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="complaints", foreign_keys=[user_id])
    assigned_staff = relationship("User", back_populates="assigned_complaints", foreign_keys=[assigned_staff_id])
    media = relationship("ComplaintMedia", back_populates="complaint", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="complaint", cascade="all, delete-orphan")


class ComplaintMedia(Base):
    __tablename__ = "complaint_media"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    file_path = Column(String(500), nullable=False)
    media_type = Column(String(20), nullable=False)  # image / video

    complaint = relationship("Complaint", back_populates="media")


# ---------------------------------------------------------------------------
# Report (staff -> admin, on a resolved complaint)
# ---------------------------------------------------------------------------
class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    staff_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    description = Column(Text, nullable=False)  # what was done to solve it
    verified = Column(Boolean, default=False)
    admin_remark = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="reports")
    staff = relationship("User", back_populates="reports")
    media = relationship("ReportMedia", back_populates="report", cascade="all, delete-orphan")


class ReportMedia(Base):
    __tablename__ = "report_media"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    file_path = Column(String(500), nullable=False)
    media_type = Column(String(20), nullable=False)

    report = relationship("Report", back_populates="media")


# ---------------------------------------------------------------------------
# Lost & Found
# ---------------------------------------------------------------------------
class LostItem(Base):
    """Items FOUND by staff/management and published by admin for users to search & claim."""
    __tablename__ = "lost_items"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    image_path = Column(String(500), nullable=True)
    found_location = Column(String(255), nullable=True)  # station / train / coach where found
    kept_at_station = Column(String(150), nullable=True)  # where user should go to claim
    date_found = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(LostItemStatus), default=LostItemStatus.unclaimed)
    uploaded_by_admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)


class LostReport(Base):
    """A user's report of THEIR lost item."""
    __tablename__ = "lost_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    item_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    lost_location = Column(String(255), nullable=True)
    date_lost = Column(DateTime, nullable=True)
    contact_info = Column(String(150), nullable=True)
    status = Column(Enum(LostReportStatus), default=LostReportStatus.pending)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="lost_reports")

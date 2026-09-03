"""
Authentication routes: signup, login (PNR or phone + password), optional OTP verification,
and staff account creation (admin-only).
"""
import random
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import (create_access_token, get_current_user, hash_password,
                     require_role, verify_password)
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory OTP store for demo purposes only. Replace with Redis / DB + real SMS gateway
# (Twilio, MSG91, etc.) in production.
_otp_store: dict[str, str] = {}


@router.post("/signup", response_model=schemas.Token)
def signup(payload: schemas.UserSignup, db: Session = Depends(get_db)):
    if not payload.pnr and not payload.phone:
        raise HTTPException(status_code=400, detail="Provide at least a PNR or a phone number")

    existing = None
    if payload.pnr:
        existing = db.query(models.User).filter(models.User.pnr == payload.pnr).first()
    if not existing and payload.phone:
        existing = db.query(models.User).filter(models.User.phone == payload.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Account already exists with this PNR/phone. Please log in.")

    user = models.User(
        username=payload.username,
        pnr=payload.pnr,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=models.UserRole.user,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return schemas.Token(access_token=token, role=user.role, user_id=user.id, username=user.username)


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = (
        db.query(models.User)
        .filter((models.User.pnr == payload.identifier) | (models.User.phone == payload.identifier))
        .first()
    )
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return schemas.Token(access_token=token, role=user.role, user_id=user.id, username=user.username)


@router.post("/send-otp")
def send_otp(payload: schemas.OTPRequest):
    """Optional OTP step. Wire this up to a real SMS provider in production."""
    otp = f"{random.randint(100000, 999999)}"
    _otp_store[payload.phone] = otp
    # DEMO ONLY: normally you would NOT return the OTP in the response.
    print(f"[DEV] OTP for {payload.phone}: {otp}")
    return {"message": "OTP sent", "dev_otp": otp}


@router.post("/verify-otp")
def verify_otp(payload: schemas.OTPVerify):
    real_otp = _otp_store.get(payload.phone)
    if real_otp is None or real_otp != payload.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    del _otp_store[payload.phone]
    return {"message": "OTP verified"}


@router.post("/create-staff", response_model=schemas.UserOut)
def create_staff(
    payload: schemas.StaffCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_role(models.UserRole.admin)),
):
    """Admin creates staff (guard / cleaning_crew / management) accounts."""
    existing = db.query(models.User).filter(models.User.phone == payload.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone already registered")

    staff = models.User(
        username=payload.username,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=models.UserRole.staff,
        staff_type=payload.staff_type,
    )
    db.add(staff)
    db.commit()
    db.refresh(staff)
    return staff


@router.post("/create-admin", response_model=schemas.UserOut)
def create_admin(
    payload: schemas.AdminCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_role(models.UserRole.admin)),
):
    """Admin creates another admin account. Only an existing admin can do this,
    so the very first admin still has to come from the startup seed in main.py."""
    existing = db.query(models.User).filter(models.User.phone == payload.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone already registered")

    new_admin = models.User(
        username=payload.username,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=models.UserRole.admin,
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return new_admin


@router.get("/users", response_model=list[schemas.UserOut])
def list_users(
    role: Optional[models.UserRole] = None,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_role(models.UserRole.admin)),
):
    """Admin-only: list accounts, optionally filtered by role (admin / staff / user).
    Used by the Manage Users screen and the staff-assignment dropdown."""
    query = db.query(models.User)
    if role is not None:
        query = query.filter(models.User.role == role)
    return query.order_by(models.User.id).all()


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

"""
Railway Complaint Management System — FastAPI entry point.

Run with:
    uvicorn app.main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from . import models
from .database import Base, engine
from .routers import auth_router, complaints_router, lost_found_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Railway Complaint Management System")

# Allow the React dev server to talk to this API. Tighten this before deploying.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth_router.router)
app.include_router(complaints_router.router)
app.include_router(lost_found_router.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "railway-complaint-management-api"}


# ---------------------------------------------------------------------------
# Convenience: seed a default admin account on first run so you can log in
# immediately. Change/remove this in production.
# ---------------------------------------------------------------------------
@app.on_event("startup")
def seed_admin():
    from sqlalchemy.orm import Session
    from .auth import hash_password
    from .database import SessionLocal

    db: Session = SessionLocal()
    try:
        existing = db.query(models.User).filter(models.User.role == models.UserRole.admin).first()
        if not existing:
            admin = models.User(
                username="admin",
                phone="9999999999",
                password_hash=hash_password("admin123"),
                role=models.UserRole.admin,
            )
            db.add(admin)
            db.commit()
            print("[seed] Default admin created -> phone: 9999999999 / password: admin123")
    finally:
        db.close()

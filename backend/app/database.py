"""
Database setup.
Uses SQLite as a lightweight, file-based "temporary" database as requested.
Swap SQLALCHEMY_DATABASE_URL below for Postgres/MySQL in production, e.g.:
    postgresql://user:password@localhost/railway_complaints
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./railway_complaints.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

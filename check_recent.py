from backend.database import SessionLocal
from backend import models
from sqlalchemy import select

with SessionLocal() as db:
    stmt = select(models.CandidateApplication).order_by(models.CandidateApplication.id.desc()).limit(10)
    candidates = db.execute(stmt).scalars().all()
    
    for c in candidates:
        print(f"ID: {c.id} | Name: {c.first_name} {c.last_name} | Status: {c.processing_status} | Error: {c.processing_error[:50] if c.processing_error else 'None'}")

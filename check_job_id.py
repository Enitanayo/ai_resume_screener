from backend.database import SessionLocal
from backend import models
from sqlalchemy import select

with SessionLocal() as db:
    stmt = select(models.CandidateApplication).order_by(models.CandidateApplication.id.desc()).limit(10)
    candidates = db.execute(stmt).scalars().all()
    
    for c in candidates:
        print(f"ID: {c.id} | Job ID: {c.job_id} | Status: {c.processing_status}")

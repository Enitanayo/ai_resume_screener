from backend.database import SessionLocal
from backend import models
from sqlalchemy import select

with SessionLocal() as db:
    stmt = select(models.CandidateApplication).where(models.CandidateApplication.id >= 50).order_by(models.CandidateApplication.id.asc())
    candidates = db.execute(stmt).scalars().all()
    
    print(f"Total candidates from ID 50: {len(candidates)}")
    for c in candidates:
        print(f"ID: {c.id} | Job ID: {c.job_id} | Status: {c.processing_status} | Error? {'Yes' if c.processing_error else 'No'}")

from backend.database import SessionLocal
from backend import models
from sqlalchemy import select

with SessionLocal() as db:
    stmt = select(models.CandidateApplication).where(models.CandidateApplication.id == 81)
    candidate = db.execute(stmt).scalars().first()
    
    if candidate:
        print(f"Error for ID {candidate.id}: {candidate.processing_error}")
    else:
        print("Candidate not found")

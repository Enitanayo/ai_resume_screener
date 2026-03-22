from backend.database import SessionLocal
from backend import models
from sqlalchemy import select

with SessionLocal() as db:
    stmt = select(models.CandidateApplication).order_by(models.CandidateApplication.id.desc()).limit(5)
    results = db.execute(stmt).scalars().all()
    for r in results:
        err = r.processing_error if r.processing_error else "None"
        print(f"ID {r.id}: {r.processing_status} | {err[:500]}")

from sqlalchemy import select
from backend.database import SessionLocal
from backend import models

def check_final_status():
    with SessionLocal() as db:
        stmt = select(models.CandidateApplication).order_by(models.CandidateApplication.id.desc()).limit(10)
        candidates = db.execute(stmt).scalars().all()
        
        print(f"{'ID':<5} | {'Status':<12} | {'Email':<25}")
        print("-" * 50)
        for c in candidates:
            print(f"{c.id:<5} | {c.processing_status:<12} | {c.email:<25}")
            if c.processing_error:
                print(f"  Error: {c.processing_error[:100]}...")

if __name__ == "__main__":
    check_final_status()

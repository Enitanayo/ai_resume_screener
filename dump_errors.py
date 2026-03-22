import sys
import os
sys.path.append(os.getcwd())

from backend.database import SessionLocal
from backend.models import CandidateApplication
from sqlalchemy import select

db = SessionLocal()
records = db.execute(select(CandidateApplication)).scalars().all()

if not records:
    print("No records found.")
else:
    for c in records:
        print(f"[{c.id}] Status: {c.processing_status} | Error: {c.processing_error[:200] if c.processing_error else None}")

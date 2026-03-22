from backend.database import SessionLocal
from backend.models import Recruiter

db = SessionLocal()
try:
    recruiters = db.query(Recruiter).all()
    print(f"Total recruiters found: {len(recruiters)}")
    for r in recruiters:
        print(f"ID: {r.id}, Name: {r.first_name} {r.last_name}, Email: {r.email}")
finally:
    db.close()

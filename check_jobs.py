from backend.database import SessionLocal
from backend.models import JobPosting

db = SessionLocal()
try:
    jobs = db.query(JobPosting).all()
    print(f"Total jobs found: {len(jobs)}")
    for job in jobs:
        print(f"ID: {job.id}, Title: {job.job_title}, Created By (Recruiter ID): {job.recruiter_id}, Status: {job.processing_status}")
finally:
    db.close()

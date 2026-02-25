from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
    status,
)
from backend.queue_client import queue
from backend.worker import process_application
from sqlalchemy.orm import Session
from sqlalchemy import select
from uuid import uuid4
from pathlib import Path
import shutil

from backend import models
from backend.schemas import CandidateApplicationPublic, CandidateApplicationCreate, CandidateApplicationPrivate
from backend.database import get_db



ALLOWED_RESUME_TYPES = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/msword": ".doc",
}

RESUME_STORAGE = Path("C:\\Projects\\resume_screener_v3_frontend\\storage")

def save_resume(file: UploadFile, job_id: int) -> str:
    if file.content_type not in ALLOWED_RESUME_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX, or DOC resumes are supported",
        )

    extension = ALLOWED_RESUME_TYPES[file.content_type]
    filename = f"{uuid4()}{extension}"

    job_dir = RESUME_STORAGE / str(job_id)
    job_dir.mkdir(parents=True, exist_ok=True)

    file_path = job_dir / filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return str(file_path)


router = APIRouter()


@router.post(
    "/apply/{job_id}",
    response_model=CandidateApplicationPublic,
    status_code=status.HTTP_201_CREATED,
)
def apply_for_job(
    job_id: int,
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    resume: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # 1. Ensure job exists
    job = db.execute(
        select(models.JobPosting).where(models.JobPosting.id == job_id)
    ).scalars().first()

    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    # 2. Enforce apply-once rule
    existing = db.execute(
        select(models.CandidateApplication).where(
            models.CandidateApplication.job_id == job_id,
            models.CandidateApplication.email == email,
        )
    ).scalars().first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already applied for this job",
        )

    # 3. Store resume
    resume_path = save_resume(resume, job_id)

    # 4. Create candidate row (PENDING)
    candidate = models.CandidateApplication(
        job_id=job_id,
        first_name=first_name,
        last_name=last_name,
        email=email,
        resume_path=resume_path,
        processing_status="pending",
    )

    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    # 5. Trigger background processing (later)
    queue.enqueue(process_application, candidate.id)

    return candidate
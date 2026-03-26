from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import Annotated
from uuid import uuid4
from pathlib import Path
import shutil

from backend import models
from backend.auth import CurrentCandidate
from backend.schemas import CandidateApplicationPublic, CandidateApplicationPrivate, CandidateResponse, JobPostingResponse, CandidateAnalytics
from backend.database import get_db
from backend.queue_client import queue

ALLOWED_RESUME_TYPES = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/msword": ".doc",
}

RESUME_STORAGE = Path(__file__).resolve().parents[2] / "storage"

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

@router.get("/me", response_model=CandidateResponse, status_code=status.HTTP_200_OK)
def get_current_candidate_profile(current_candidate: CurrentCandidate):
    return current_candidate

@router.get("/me/analytics", response_model=CandidateAnalytics, status_code=status.HTTP_200_OK)
def get_my_analytics(current_candidate: CurrentCandidate, db: Annotated[Session, Depends(get_db)]):
    status_stmt = (
        select(
            models.CandidateApplication.processing_status,
            func.count(models.CandidateApplication.id)
        )
        .where(models.CandidateApplication.candidate_id == current_candidate.id)
        .group_by(models.CandidateApplication.processing_status)
    )
    status_counts = dict(db.execute(status_stmt).all())
    
    total = sum(status_counts.values())
    pending = status_counts.get("pending", 0) + status_counts.get("processing", 0)
    scored = status_counts.get("ready", 0)
    
    return CandidateAnalytics(
        total_applications=total,
        pending_applications=pending,
        scored_applications=scored
    )

@router.get("/me/applications", response_model=list[CandidateApplicationPublic], status_code=status.HTTP_200_OK)
def get_my_applications(current_candidate: CurrentCandidate, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(
        select(models.CandidateApplication)
        .where(models.CandidateApplication.candidate_id == current_candidate.id)
        .order_by(models.CandidateApplication.applied_at.desc())
    )
    return result.scalars().all()

@router.get("/me/applications/{application_id}", response_model=CandidateApplicationPublic, status_code=status.HTTP_200_OK)
def get_application_details(application_id: int, current_candidate: CurrentCandidate, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(
        select(models.CandidateApplication)
        .where(models.CandidateApplication.id == application_id)
        .where(models.CandidateApplication.candidate_id == current_candidate.id)
    )
    application = result.scalars().first()
    
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
        
    return application

@router.post("/jobs/{job_id}/apply", response_model=CandidateApplicationPublic, status_code=status.HTTP_201_CREATED)
def apply_for_job(
    job_id: int,
    current_candidate: CurrentCandidate,
    resume: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # 1. Ensure job exists
    job = db.execute(select(models.JobPosting).where(models.JobPosting.id == job_id)).scalars().first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    # 2. Enforce apply-once rule
    existing = db.execute(
        select(models.CandidateApplication).where(
            models.CandidateApplication.job_id == job_id,
            models.CandidateApplication.candidate_id == current_candidate.id,
        )
    ).scalars().first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already applied for this job",
        )

    # 3. Store resume
    resume_path = save_resume(resume, job_id)

    # 4. Create candidate application row
    application = models.CandidateApplication(
        job_id=job_id,
        candidate_id=current_candidate.id,
        resume_path=resume_path,
        processing_status="pending",
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    # 5. Trigger background processing
    queue.enqueue("backend.worker.process_application", application.id)

    return application

@router.get("/jobs", response_model=list[JobPostingResponse], status_code=status.HTTP_200_OK)
def get_all_job_postings(db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.JobPosting))
    return result.scalars().all()

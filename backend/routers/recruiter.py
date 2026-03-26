from datetime import timedelta
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from collections import Counter

from backend import models
from backend.auth import (
    CurrentRecruiter,
)
from backend.queue_client import queue
# from backend.worker import process_job, process_application
from backend.config import settings
from backend.database import get_db
from backend.schemas import RecruiterCreate, RecruiterResponse, JobPostingCreate, JobPostingResponse, JobPostingUpdate, CandidateApplicationPrivate, CandidateApplicationPublic, Analytics, BatchUploadResponse, BatchUploadFileResult, DashboardAnalytics
from backend.routers.candidate import save_resume, ALLOWED_RESUME_TYPES

router = APIRouter()

@router.post("", response_model=JobPostingResponse, status_code=status.HTTP_201_CREATED)
def create_job_posting(job:JobPostingCreate, current_recruiter:CurrentRecruiter, db: Annotated[Session, Depends(get_db)]):
    
    job_posting = models.JobPosting(
          job_title = job.job_title,
          job_description = job.job_description,
          required_skills = job.required_skills,
          recruiter_id =  current_recruiter.id 
     )
    db.add(job_posting)
    db.commit()
    db.refresh(job_posting)

    # Get the job posting id and use it to initiate background processing of the job
    job_id = job_posting.id
    queue.enqueue("backend.worker.process_job", job_id)

    return job_posting

@router.get("", response_model=list[JobPostingResponse], status_code=status.HTTP_200_OK)
def get_job_postings(current_recruiter:CurrentRecruiter, db:Annotated[Session, Depends(get_db)]):
    
    result = db.execute(
        select(models.JobPosting).where(models.JobPosting.recruiter_id == current_recruiter.id)
    )
    job_postings = result.scalars().all()
    return job_postings

@router.get("/analytics/dashboard", response_model=DashboardAnalytics, status_code=status.HTTP_200_OK)
def get_dashboard_analytics(
    current_recruiter: CurrentRecruiter,
    db: Annotated[Session, Depends(get_db)]
):
    # Get all jobs for recruiter
    jobs = db.execute(
        select(models.JobPosting).where(models.JobPosting.recruiter_id == current_recruiter.id)
    ).scalars().all()
    job_ids = [j.id for j in jobs]
    
    if not job_ids:
        return DashboardAnalytics(
            total_jobs=0,
            total_candidates=0,
            processing_candidates=0,
            ready_candidates=0,
            average_candidate_score=0.0
        )
    
    # Get applicant stats for these jobs
    agg_stmt = (
        select(
            func.count(models.CandidateApplication.id).label("total"),
            func.avg(models.CandidateApplication.total_weighted_score).label("avg_score")
        )
        .where(models.CandidateApplication.job_id.in_(job_ids))
    )
    total_cands, avg_score = db.execute(agg_stmt).one()
    
    # Get applicant status breakdown
    status_stmt = (
        select(
            models.CandidateApplication.processing_status,
            func.count(models.CandidateApplication.id)
        )
        .where(models.CandidateApplication.job_id.in_(job_ids))
        .group_by(models.CandidateApplication.processing_status)
    )
    status_counts = dict(db.execute(status_stmt).all())
    
    return DashboardAnalytics(
        total_jobs=len(jobs),
        total_candidates=total_cands or 0,
        processing_candidates=status_counts.get("processing", 0) + status_counts.get("pending", 0),
        ready_candidates=status_counts.get("ready", 0),
        average_candidate_score=avg_score or 0.0
    )

@router.get("/{job_id}", response_model=JobPostingResponse, status_code=status.HTTP_200_OK)
def get_job_posting(job_id: int, current_recruiter: CurrentRecruiter, db: Annotated[Session, Depends(get_db)]):
    stmt = (
        select(models.JobPosting)
        .where(models.JobPosting.id == job_id)
        .where(models.JobPosting.recruiter_id == current_recruiter.id)
    ) # Get Job with job id that was created by this specific recruiter

    result = db.execute(stmt)
    job = result.scalars().first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    return job

@router.patch("/{job_id}", response_model= JobPostingResponse, status_code=status.HTTP_200_OK)
def edit_job_posting(job_id: int, job_posting:JobPostingUpdate, current_recruiter:CurrentRecruiter, db:Annotated[Session, Depends(get_db)]):
    stmt = (
        select(models.JobPosting)
        .where(models.JobPosting.id == job_id)
        .where(models.JobPosting.recruiter_id == current_recruiter.id)
    ) # Get Job with job id that was created by this specific recruiter

    result = db.execute(stmt)
    job = result.scalars().first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )
    
    if job_posting.job_description or job_posting.required_skills:
        # if they update description or required skills process the job again and also reprocess all applications
        queue.enqueue("backend.worker.process_job", job_id)
        results = db.execute(
            select(models.CandidateApplication).where(models.CandidateApplication.job_id == job_id)
        )
        candidates = results.scalars().all()
        if candidates:
            c_ids = [c.id for c in candidates]
            queue.enqueue("backend.worker.batch_processing", c_ids)
            # for candidate in candidates:
            #     queue.enqueue("backend.worker.process_application", candidate.id)

    update_data = job_posting.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)
    return job

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job_posting(
    job_id: int,
    current_recruiter: CurrentRecruiter,
    db: Annotated[Session, Depends(get_db)],
):
    stmt = (
        select(models.JobPosting)
        .where(models.JobPosting.id == job_id)
        .where(models.JobPosting.recruiter_id == current_recruiter.id)
    ) # Get Job with job id that was created by this specific recruiter

    result = db.execute(stmt)
    job = result.scalars().first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    db.delete(job)
    db.commit()

@router.get("/{job_id}/candidates", response_model=list[CandidateApplicationPrivate], status_code=status.HTTP_200_OK,)
def get_candidates_for_job(
    job_id: int,
    current_recruiter: CurrentRecruiter,
    db: Annotated[Session, Depends(get_db)],
    status_filter: str | None = Query(None, alias="status"),
    sort_by: str = Query("score"),
    sort_order: str = Query("desc"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    # Authorization: ensure recruiter owns the job
    job_stmt = (
        select(models.JobPosting)
        .where(models.JobPosting.id == job_id)
        .where(models.JobPosting.recruiter_id == current_recruiter.id)
    )

    job = db.execute(job_stmt).scalars().first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    # Base query for candidates
    stmt = (
        select(models.CandidateApplication)
        .where(models.CandidateApplication.job_id == job_id)
    )
    
    # Filter by status if provided
    if status_filter:
        stmt = stmt.where(models.CandidateApplication.processing_status == status_filter)

    # Sort
    if sort_by == "applied_at":
        order_col = models.CandidateApplication.applied_at
    else:
        order_col = models.CandidateApplication.total_weighted_score
        
    if sort_order == "asc":
        stmt = stmt.order_by(order_col.asc().nullslast())
    else:
        stmt = stmt.order_by(order_col.desc().nullslast())

    # Pagination
    stmt = stmt.offset(skip).limit(limit)

    result = db.execute(stmt)
    candidates = result.scalars().all()

    return candidates

@router.get("/{job_id}/analytics", response_model=Analytics, status_code=status.HTTP_200_OK,)
def get_analytics_for_job(
    db: Annotated[Session, Depends(get_db)],
    job_id: int,
    current_recruiter:CurrentRecruiter, 
):
    # Authorization: ensure recruiter owns the job
    job_stmt = (
        select(models.JobPosting)
        .where(models.JobPosting.id == job_id)
        .where(models.JobPosting.recruiter_id == current_recruiter.id)
    )

    job = db.execute(job_stmt).scalars().first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )
    
    base_filter = (
        models.CandidateApplication.job_id == job_id,
        models.CandidateApplication.processing_status == "ready",
    )

    # Numeric aggregations
    agg_stmt = (
        select(
            func.count(models.CandidateApplication.id),
            func.avg(models.CandidateApplication.total_weighted_score),
        )
        .where(*base_filter)
    )

    total_applicants, average_score = db.execute(agg_stmt).one()

    # Skill aggregation
    skills_stmt = (
        select(models.CandidateApplication.parsed_skills)
        .where(*base_filter)
        .where(models.CandidateApplication.parsed_skills.is_not(None))
    )

    skill_rows = db.execute(skills_stmt).scalars().all()

    counter = Counter()
    for skills in skill_rows:
        counter.update(skills)

    top_skills = [skill for skill, _ in counter.most_common(10)]

    return {
        "total_applicants": total_applicants,
        "average_score": average_score or 0.0,
        "top_skills": top_skills,
    }

@router.get("/{job_id}/candidate/{candidate_id}", response_model=CandidateApplicationPrivate, status_code=status.HTTP_200_OK,)
def get_candidate(job_id:int, candidate_id: int, current_recruiter:CurrentRecruiter, db:Annotated[Session, Depends(get_db)]):
    # Authorization: ensure recruiter owns the job
    job_stmt = (
        select(models.JobPosting)
        .where(models.JobPosting.id == job_id)
        .where(models.JobPosting.recruiter_id == current_recruiter.id)
    )

    job = db.execute(job_stmt).scalars().first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    # Fetch candidate by id, scoped to this job
    stmt = (
        select(models.CandidateApplication)
        .where(models.CandidateApplication.id == candidate_id)
        .where(models.CandidateApplication.job_id == job_id)
    )

    result = db.execute(stmt)
    candidate = result.scalars().first()

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found",
        )

    return candidate


@router.post("/batch_processing/{job_id}", status_code = status.HTTP_200_OK)
def batch_processing(job_id:int, current_recruiter:CurrentRecruiter, db:Annotated[Session, Depends(get_db)]):
  stmt = (
        select(models.JobPosting)
        .where(models.JobPosting.id == job_id)
        .where(models.JobPosting.recruiter_id == current_recruiter.id)
    ) # Get Job with job id that was created by this specific recruiter

  result = db.execute(stmt)
  job = result.scalars().first()

  if not job:
      raise HTTPException(
          status_code=status.HTTP_404_NOT_FOUND,
          detail="Job not found",
      )

  results = db.execute(
          select(models.CandidateApplication).where(models.CandidateApplication.job_id == job_id)
      )
  candidates = results.scalars().all()
  if not candidates:
      return {"message": "No candidates to process", "count": 0}

  c_ids = [c.id for c in candidates]
  queue.enqueue("backend.worker.batch_processing", c_ids)
  return {"message": "Batch processing started", "count": len(c_ids), "candidate_ids": c_ids}

MAX_BATCH_FILES = 50

@router.post("/{job_id}/batch-upload", response_model=BatchUploadResponse, status_code=status.HTTP_201_CREATED)
def batch_upload_resumes(
    job_id: int,
    resumes: Annotated[List[UploadFile], File(...)],
    current_recruiter: CurrentRecruiter,    
    db: Annotated[Session, Depends(get_db)]
):
    # 1. Validate file count
    if len(resumes) > MAX_BATCH_FILES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {MAX_BATCH_FILES} files per batch upload. Received {len(resumes)}.",
        )

    if not resumes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided.",
        )

    # 2. Ensure recruiter owns the job
    job = db.execute(
        select(models.JobPosting)
        .where(models.JobPosting.id == job_id)
        .where(models.JobPosting.recruiter_id == current_recruiter.id)
    ).scalars().first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    # 3. Process each file
    results: list[BatchUploadFileResult] = []
    created_ids: list[int] = []

    for resume_file in resumes:
        filename = resume_file.filename or "unknown"

        # Validate file type
        if resume_file.content_type not in ALLOWED_RESUME_TYPES:
            results.append(BatchUploadFileResult(
                filename=filename,
                status="invalid_type",
                detail=f"Unsupported file type: {resume_file.content_type}. Only PDF, DOCX, DOC are allowed.",
            ))
            continue

        try:
            # Save file to disk
            resume_path = save_resume(resume_file, job_id)

            # Create application row
            application = models.CandidateApplication(
                job_id=job_id,
                candidate_id=None,
                source="batch_upload",
                resume_path=resume_path,
                processing_status="pending",
            )
            db.add(application)
            db.flush()  # Get the ID without committing

            created_ids.append(application.id)
            results.append(BatchUploadFileResult(
                filename=filename,
                status="created",
                application_id=application.id,
            ))
        except Exception as exc:
            results.append(BatchUploadFileResult(
                filename=filename,
                status="error",
                detail=str(exc),
            ))

    # 4. Commit all created applications
    db.commit()

    # 5. Enqueue batch processing for all successfully created applications
    if created_ids:
        queue.enqueue("backend.worker.batch_processing", created_ids)

    created_count = sum(1 for r in results if r.status == "created")
    failed_count = len(results) - created_count

    return BatchUploadResponse(
        message=f"Batch upload complete. {created_count} resumes queued for processing.",
        total_files=len(resumes),
        created=created_count,
        failed=failed_count,
        results=results,
    )
from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from collections import Counter

from backend import models
from backend.auth import (
    CurrentRecruiter,
)
from backend.queue_client import queue
from backend.worker import process_job, process_application
from backend.config import settings
from backend.database import get_db
from backend.schemas import RecruiterCreate, RecruiterResponse, JobPostingCreate, JobPostingResponse, JobPostingUpdate, CandidateApplicationPrivate, CandidateApplicationPublic, Analytics

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
    queue.enqueue(process_job, job_id)

    return job_posting

@router.get("", response_model=list[JobPostingResponse], status_code=status.HTTP_200_OK)
def get_job_postings(current_recruiter:CurrentRecruiter, db:Annotated[Session, Depends(get_db)]):
    
    result = db.execute(
        select(models.JobPosting).where(models.JobPosting.recruiter_id == current_recruiter.id)
    )
    job_postings = result.scalars().all()
    return job_postings

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
        queue.enqueue(process_job, job_id)
        results = db.execute(
            select(models.CandidateApplication).where(models.CandidateApplication.job_id == job_id)
        )
        candidates = results.scalars().all()
        for candidate in candidates:
            queue.enqueue(process_application, candidate.id)

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

    # Fetch candidates, sorted by score
    stmt = (
        select(models.CandidateApplication)
        .where(models.CandidateApplication.job_id == job_id)
        .where(models.CandidateApplication.processing_status == "ready")
        .order_by(
            models.CandidateApplication.total_weighted_score.desc().nullslast()
        )
    )

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
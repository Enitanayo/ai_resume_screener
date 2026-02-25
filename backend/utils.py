from sqlalchemy.orm import Session
from sqlalchemy import select

from backend import models
from backend import schemas

# -------------------------
# Recruiter
# -------------------------

def get_recruiter_by_id(db: Session, recruiter_id: int) -> models.Recruiter | None:
    result = db.execute(
        select(models.Recruiter).where(models.Recruiter.id == recruiter_id)
    )
    return result.scalars().first()


def get_recruiter_by_email(db: Session, email: str) -> models.Recruiter | None:
    result = db.execute(
        select(models.Recruiter).where(models.Recruiter.email == email)
    )
    return result.scalars().first()


def create_recruiter(
    db: Session,
    recruiter_in: schemas.RecruiterCreate,
) -> models.Recruiter:
    recruiter = models.Recruiter(
        first_name=recruiter_in.first_name,
        last_name=recruiter_in.last_name,
        email=recruiter_in.email,
    )

    db.add(recruiter)
    db.commit()
    db.refresh(recruiter)
    return recruiter


# -------------------------
# Job Postings
# -------------------------

def create_job_posting(
    db: Session,
    job_in: schemas.JobPostingCreate,
) -> models.JobPosting:
    job = models.JobPosting(
        job_title=job_in.job_title,
        job_description=job_in.job_description,
        required_skills=job_in.required_skills,
        recruiter_id=job_in.recruiter_id,
        processing_status="pending",
    )

    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def get_job_by_id(db: Session, job_id: int) -> models.JobPosting | None:
    result = db.execute(
        select(models.JobPosting).where(models.JobPosting.id == job_id)
    )
    return result.scalars().first()


def list_jobs_for_recruiter(
    db: Session,
    recruiter_id: int,
) -> list[models.JobPosting]:
    result = db.execute(
        select(models.JobPosting)
        .where(models.JobPosting.recruiter_id == recruiter_id)
        .order_by(models.JobPosting.created_at.desc())
    )
    return result.scalars().all()


# -------------------------
# Candidate Applications
# -------------------------

def create_candidate_application(
    db: Session,
    application_in: schemas.CandidateApplicationCreate,
) -> models.CandidateApplication:
    application = models.CandidateApplication(
        job_id=application_in.job_id,
        first_name=application_in.first_name,
        last_name=application_in.last_name,
        email=application_in.email,
        resume_path=application_in.resume_path,
        processing_status="pending",
    )

    db.add(application)
    db.commit()
    db.refresh(application)
    return application


def get_candidate_application_by_id(
    db: Session,
    application_id: int,
) -> models.CandidateApplication | None:
    result = db.execute(
        select(models.CandidateApplication)
        .where(models.CandidateApplication.id == application_id)
    )
    return result.scalars().first()


def list_candidates_for_job(
    db: Session,
    job_id: int,
    only_ready: bool = False,
) -> list[models.CandidateApplication]:
    stmt = select(models.CandidateApplication).where(
        models.CandidateApplication.job_id == job_id
    )

    if only_ready:
        stmt = stmt.where(models.CandidateApplication.processing_status == "ready")

    stmt = stmt.order_by(
        models.CandidateApplication.total_weighted_score.desc().nullslast()
    )

    result = db.execute(stmt)
    return result.scalars().all()



def mark_application_processing(
    db: Session,
    application: models.CandidateApplication,
):
    application.processing_status = "processing"
    db.commit()


def mark_application_failed(
    db: Session,
    application: models.CandidateApplication,
    error: str,
):
    application.processing_status = "failed"
    application.processing_error = error
    db.commit()


def save_application_scores(
    db: Session,
    application: models.CandidateApplication,
    *,
    parsed_skills: list[str],
    resume_vector: list[float],
    candidate_skills_vector: list[float],
    semantic_score: float,
    context_score: float,
    keyword_score: float,
    total_weighted_score: float,
):
    application.parsed_skills = parsed_skills
    application.resume_vector = resume_vector
    application.candidate_skills_vector = candidate_skills_vector

    application.semantic_score = semantic_score
    application.context_score = context_score
    application.keyword_score = keyword_score
    application.total_weighted_score = total_weighted_score

    application.processing_status = "ready"
    db.commit()
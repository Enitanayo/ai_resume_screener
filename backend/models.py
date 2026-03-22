from __future__ import annotations # we can use the job class before its definition
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Integer, String, Text, DateTime, JSON, Float, UniqueConstraint
from pgvector.sqlalchemy import Vector 

from datetime import datetime, UTC

from backend.database import Base
from backend.config import settings

class Recruiter(Base):
    __tablename__ = "recruiters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    first_name:Mapped[str] = mapped_column(String, nullable=False)
    last_name:Mapped[str] = mapped_column(String, nullable=False)
    email:Mapped[str] = mapped_column(String, nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(200), nullable=False)

    jobs: Mapped[list[JobPosting]] = relationship(back_populates="recruiter", cascade="all, delete-orphan")


class JobPosting(Base):
    __tablename__ = "job_postings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    job_title:Mapped[str] = mapped_column(String, nullable=False)
    job_description: Mapped[str] = mapped_column(Text, nullable=False)
    required_skills: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    recruiter_id: Mapped[int] = mapped_column(
        ForeignKey("recruiters.id"),
        nullable = False,
        index = True
    )

    job_vector: Mapped[list[float] | None] = mapped_column(Vector(384), nullable=True)
    skills_vector: Mapped[list[float] | None] = mapped_column(Vector(384), nullable=True)

    processing_status: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default="pending",  # pending | processing | ready | failed
        index=True
    )

    processing_error: Mapped[str | None] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC), index=True)

    recruiter: Mapped[Recruiter] = relationship(back_populates="jobs")
    candidates: Mapped[list[CandidateApplication]] = relationship(back_populates="job", cascade="all, delete-orphan")

class CandidateApplication(Base):
    __tablename__ = "candidates_applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    first_name:Mapped[str] = mapped_column(String, nullable=False)
    last_name:Mapped[str] = mapped_column(String, nullable=False)
    email:Mapped[str] = mapped_column(String, nullable=False)
    resume_path: Mapped[str] = mapped_column(String, nullable=False) # Change to Text Column later?
    job_id: Mapped[int] = mapped_column(
        ForeignKey("job_postings.id"),
        nullable=False,
        index=True
    )
    raw_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    parsed_skills: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    resume_vector: Mapped[list[float] | None] = mapped_column(Vector(384), nullable=True)
    candidate_skills_vector: Mapped[list[float] | None] = mapped_column(Vector(384), nullable=True)
    matched_skills:Mapped[list[str] | None] = mapped_column(JSON, nullable=True)

    semantic_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    context_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    keyword_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_weighted_score: Mapped[float | None] = mapped_column(Float, nullable=True, index=True)

    processing_status: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default="pending",  # pending | processing | ready | failed
        index=True
    )

    processing_error: Mapped[str | None] = mapped_column(String, nullable=True)

    applied_at: Mapped[datetime] = mapped_column(DateTime, default= lambda: datetime.now(UTC), index=True)
    #TODO add property for resume path?

    job: Mapped[JobPosting] = relationship(back_populates="candidates")

    __table_args__ = (UniqueConstraint("job_id", "email", name="_job_email_uc"),) # Enforcing one application per email per job )
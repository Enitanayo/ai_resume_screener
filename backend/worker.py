from backend.config import settings
from backend.database import SessionLocal
from backend.services.embedding import embedding_service, EmbeddingError
from backend.services.parser import parser, ParserError
from backend.services.scorer import scorer, ScoringError
from sqlalchemy import select
from backend import models


def process_job(job_id: int):
    with SessionLocal() as db:
        result = db.execute(
            select(models.JobPosting).where(models.JobPosting.id == job_id)
        )

        job_posting = result.scalars().first()

        if not job_posting:
            return

        job_posting.processing_status = "processing"
        job_posting.processing_error = None
        db.commit()

        errors = []

        # --- Step 1: embed job description ---
        try:
            if not job_posting.job_description:
                raise EmbeddingError("job_description is empty")
            job_posting.job_vector = embedding_service.generate_embedding(job_posting.job_description)
        except EmbeddingError as exc:
            import traceback
            errors.append(f"job_vector failed: {exc} | {traceback.format_exc()}")

        # --- Step 2: embed required skills ---
        try:
            skills = job_posting.required_skills
            if not skills:
                raise EmbeddingError("required_skills is empty or None")
            skills_text = ", ".join(skills)
            job_posting.skills_vector = embedding_service.generate_embedding(skills_text)
        except EmbeddingError as exc:
            import traceback
            errors.append(f"skills_vector failed: {exc} | {traceback.format_exc()}")

        if errors:
            job_posting.processing_status = "failed"
            job_posting.processing_error = " || ".join(errors)
        else:
            job_posting.processing_status = "ready"

        db.commit()


def process_application(candidate_id: int):
    # Use SessionLocal() directly — get_db() is a generator for FastAPI Depends only
    with SessionLocal() as db:
        result = db.execute(
            select(models.CandidateApplication).where(models.CandidateApplication.id == candidate_id)
        )

        candidate_application = result.scalars().first()

        if not candidate_application:
            return

        # mark as processing
        candidate_application.processing_status = "processing"
        candidate_application.processing_error = None
        db.commit()

        try:  # PARSE RESUME → GET SKILLS & RAW TEXT → GENERATE EMBEDDINGS → SCORE
            result = parser.parse(candidate_application.resume_path)
            candidate_application.parsed_skills = result['skills']
            candidate_application.raw_text = result['raw_text']
            candidate_application.resume_vector = embedding_service.generate_embedding(candidate_application.raw_text)
            candidate_application.candidate_skills_vector = embedding_service.generate_embedding(" ".join(candidate_application.parsed_skills))
            scores = scorer.calculate_match(
                job_embedding=candidate_application.job.job_vector,
                candidate_embedding=candidate_application.resume_vector,
                job_requirements_embedding=candidate_application.job.skills_vector,
                candidate_skills_embedding=candidate_application.candidate_skills_vector,
                job_skills=candidate_application.job.required_skills,
                candidate_text=candidate_application.raw_text
            )
            candidate_application.matched_skills = scores['matched_skills']
            candidate_application.context_score = scores['context_score']
            candidate_application.semantic_score = scores['skills_semantic_score']
            candidate_application.keyword_score = scores['keyword_score']
            candidate_application.total_weighted_score = scores['total_score']
            candidate_application.processing_status = "ready"
        except ParserError as exc:
            candidate_application.processing_status = "failed"
            candidate_application.processing_error = str(exc)
        except EmbeddingError as exc:
            candidate_application.processing_status = "failed"
            candidate_application.processing_error = str(exc)
        except ScoringError as exc:
            candidate_application.processing_status = "failed"
            candidate_application.processing_error = str(exc)
        except Exception as exc:
            candidate_application.processing_status = "failed"
            candidate_application.processing_error = str(exc)
        finally:
            db.commit()


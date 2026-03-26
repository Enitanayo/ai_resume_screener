from concurrent.futures import ThreadPoolExecutor
import traceback

from backend.database import SessionLocal
from backend.services.embedding import embedding_service, EmbeddingError
from backend.services.parser import parser, ParserError
from backend.services.scorer import scorer, ScoringError
from sqlalchemy import select, update
from backend import models
from sqlalchemy.orm import joinedload


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
            errors.append(f"job_vector failed: {exc} | {traceback.format_exc()}")

        # --- Step 2: embed required skills ---
        try:
            skills = job_posting.required_skills
            if not skills:
                raise EmbeddingError("required_skills is empty or None")
            skills_text = ", ".join(skills)
            job_posting.skills_vector = embedding_service.generate_embedding(skills_text)
        except EmbeddingError as exc:
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
            # Store extracted contact info (from LLM) for batch uploads
            if not candidate_application.applicant_name and result.get('name'):
                candidate_application.applicant_name = result['name']
            if not candidate_application.applicant_email and result.get('email'):
                candidate_application.applicant_email = result['email']
            with ThreadPoolExecutor(max_workers=2) as executor:
                future_resume = executor.submit(
                    embedding_service.generate_embedding,
                    candidate_application.raw_text,
                )
                future_skills = executor.submit(
                    embedding_service.generate_embedding,
                    " ".join(candidate_application.parsed_skills),
                )
                candidate_application.resume_vector = future_resume.result()
                candidate_application.candidate_skills_vector = future_skills.result()
            scores = scorer.calculate_match(
                job_embedding=candidate_application.job.job_vector,
                candidate_embedding=candidate_application.resume_vector,
                job_requirements_embedding=candidate_application.job.skills_vector,
                candidate_skills_embedding=candidate_application.candidate_skills_vector,
                job_skills=candidate_application.job.required_skills,
                candidate_text=candidate_application.raw_text,
                candidate_skills=candidate_application.parsed_skills,
            )
            candidate_application.matched_skills = scores['matched_skills']
            candidate_application.context_score = scores['context_score']
            candidate_application.semantic_score = scores['skills_semantic_score']
            candidate_application.keyword_score = scores['keyword_score']
            candidate_application.total_weighted_score = scores['total_score']
            candidate_application.processing_status = "ready"
        except ParserError as exc:
            candidate_application.processing_status = "failed"
            candidate_application.processing_error = f"ParserError: {exc} | {traceback.format_exc()}"
        except EmbeddingError as exc:
            candidate_application.processing_status = "failed"
            candidate_application.processing_error = f"EmbeddingError: {exc} | {traceback.format_exc()}"
        except ScoringError as exc:
            candidate_application.processing_status = "failed"
            candidate_application.processing_error = f"ScoringError: {exc} | {traceback.format_exc()}"
        except Exception as exc:
            candidate_application.processing_status = "failed"
            candidate_application.processing_error = f"UnexpectedError: {exc} | {traceback.format_exc()}"
        finally:
            db.commit()


def batch_processing(candidate_ids: list[int]):
    """
    Process multiple candidate applications concurrently.

    Speed gains:
      - parser.parse() calls (Gemini LLM) run in parallel via ThreadPoolExecutor
      - Embeddings are batch-encoded in two model.encode() calls
      - Single DB commit at the end
    Errors are isolated per-candidate so one failure doesn't kill the batch.
    """
    with SessionLocal() as db:
        # ── 1. Fetch all candidates + their parent job in one query ───────────
        apps = db.execute(
            select(models.CandidateApplication)
            .options(joinedload(models.CandidateApplication.job))
            .where(models.CandidateApplication.id.in_(candidate_ids))
        ).unique().scalars().all()

        if not apps:
            return

        # Mark all as processing in one UPDATE statement
        db.execute(
            update(models.CandidateApplication)
            .where(models.CandidateApplication.id.in_(candidate_ids))
            .values(processing_status="processing", processing_error=None)
        )
        db.commit()

        # ── 2. Parse resumes concurrently (the main speedup) ──────────────────
        # parser.parse() is I/O-bound (Gemini API call), so threads work great.
        # With max_workers=5, 10 resumes ~10s instead of ~50s sequentially.
        def _safe_parse(app):
            """Parse one resume, returning (candidate_id, result_dict) or (candidate_id, Exception)."""
            try:
                result = parser.parse(app.resume_path)
                return (app.id, result)
            except Exception as exc:
                return (app.id, exc)

        with ThreadPoolExecutor(max_workers=5) as executor:
            parse_outcomes = list(executor.map(_safe_parse, apps))

        # Separate successes from failures
        app_map = {a.id: a for a in apps}
        parsed_apps = []  # apps that parsed successfully
        for cid, outcome in parse_outcomes:
            app = app_map[cid]
            if isinstance(outcome, Exception):
                app.processing_status = "failed"
                app.processing_error = f"ParserError: {outcome}"
            else:
                app.parsed_skills = outcome.get("skills", [])
                app.raw_text = outcome.get("raw_text", "")
                # Store extracted contact info for batch uploads
                if not app.applicant_name and outcome.get("name"):
                    app.applicant_name = outcome["name"]
                if not app.applicant_email and outcome.get("email"):
                    app.applicant_email = outcome["email"]
                parsed_apps.append(app)
        db.commit()

        if not parsed_apps:
            return

        # ── 3. Batch embed (two model.encode() calls for all candidates) ──────
        raw_texts = [a.raw_text for a in parsed_apps]
        skill_texts = [" ".join(a.parsed_skills or []) for a in parsed_apps]

        try:
            with ThreadPoolExecutor(max_workers=2) as executor:
                future_resume_vecs = executor.submit(
                    embedding_service.model.encode, raw_texts
                )
                future_skills_vecs = executor.submit(
                    embedding_service.model.encode, skill_texts
                )
                resume_vecs = future_resume_vecs.result()
                skills_vecs = future_skills_vecs.result()
        except Exception as exc:
            # If embedding fails entirely, mark all remaining as failed
            for app in parsed_apps:
                app.processing_status = "failed"
                app.processing_error = f"EmbeddingError: {exc}"
            db.commit()
            return

        # ── 4. Score each candidate ───────────────────────────────────────────
        for app, rv, sv in zip(parsed_apps, resume_vecs, skills_vecs):
            try:
                app.resume_vector = rv.tolist()
                app.candidate_skills_vector = sv.tolist()

                job = app.job  # already eager-loaded
                scores = scorer.calculate_match(
                    job_embedding=job.job_vector,
                    candidate_embedding=app.resume_vector,
                    job_requirements_embedding=job.skills_vector,
                    candidate_skills_embedding=app.candidate_skills_vector,
                    job_skills=job.required_skills,
                    candidate_text=app.raw_text,
                    candidate_skills=app.parsed_skills,
                )
                app.matched_skills = scores["matched_skills"]
                app.context_score = scores["context_score"]
                app.semantic_score = scores["skills_semantic_score"]
                app.keyword_score = scores["keyword_score"]
                app.total_weighted_score = scores["total_score"]
                app.processing_status = "ready"
            except (ScoringError, Exception) as exc:
                app.processing_status = "failed"
                app.processing_error = f"ScoringError: {exc}"

        # ── 5. Single final commit ────────────────────────────────────────────
        db.commit()
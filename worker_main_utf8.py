from concurrent.futures import ThreadPoolExecutor
import json
import time
import tempfile

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
    # Use SessionLocal() directly ΓÇö get_db() is a generator for FastAPI Depends only
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

        try:  # PARSE RESUME ΓåÆ GET SKILLS & RAW TEXT ΓåÆ GENERATE EMBEDDINGS ΓåÆ SCORE
            result = parser.parse(candidate_application.resume_path)
            candidate_application.parsed_skills = result['skills']
            candidate_application.raw_text = result['raw_text']
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
            import traceback
            candidate_application.processing_status = "failed"
            candidate_application.processing_error = f"ParserError: {exc} | {traceback.format_exc()}"
        except EmbeddingError as exc:
            import traceback
            candidate_application.processing_status = "failed"
            candidate_application.processing_error = f"EmbeddingError: {exc} | {traceback.format_exc()}"
        except ScoringError as exc:
            import traceback
            candidate_application.processing_status = "failed"
            candidate_application.processing_error = f"ScoringError: {exc} | {traceback.format_exc()}"
        except Exception as exc:
            import traceback
            candidate_application.processing_status = "failed"
            candidate_application.processing_error = f"UnexpectedError: {exc} | {traceback.format_exc()}"
        finally:
            db.commit()

# worker.py

def process_application_batch(job_id: int, candidate_ids: list[int]):
    with SessionLocal() as db:
        candidates = db.execute(
            select(models.CandidateApplication)
            .where(models.CandidateApplication.id.in_(candidate_ids))
        ).scalars().all()

        for c in candidates:
            c.processing_status = "processing"
            c.processing_error = None
        db.commit()

        # ΓöÇΓöÇ PHASE 1: Extract raw text from files (local, fast) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        parsed_texts = {}   # candidate_id -> clean_text
        for c in candidates:
            try:
                raw = parser._extract_text(c.resume_path)
                parsed_texts[c.id] = parser._clean_text(raw)
            except Exception as exc:
                c.processing_status = "failed"
                c.processing_error = str(exc)
        db.commit()

        ready_ids = list(parsed_texts.keys())
        if not ready_ids:
            return

        # ΓöÇΓöÇ PHASE 2: Submit all parse prompts to Gemini Batch API ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        PROMPT_TEMPLATE = """
You are an expert HR Resume Parser. Return ONLY valid JSON.

Required keys:
- skills: list[str]
- experience_years: float
- education: list[str]

Resume Text:
{text}
"""
        requests_data = [
            {
                "key": str(cid),
                "request": {
                    "contents": [{"parts": [{"text": PROMPT_TEMPLATE.format(text=parsed_texts[cid][:15000])}]}],
                    "generationConfig": {"response_mime_type": "application/json"},
                },
            }
            for cid in ready_ids
        ]

        # Write JSONL to a temp file and upload
        with tempfile.NamedTemporaryFile("w", suffix=".jsonl", delete=False) as f:
            for req in requests_data:
                f.write(json.dumps(req) + "\n")
            jsonl_path = f.name

        uploaded = parser.client.files.upload(
            file=jsonl_path,
            config={"display_name": f"batch-parse-job-{job_id}",
                    "mime_type": "application/jsonl"},
        )

        batch_job = parser.client.batches.create(
            model="gemini-2.5-flash",
            src=uploaded.name,
            config={"display_name": f"resume-batch-{job_id}"},
        )

        # ΓöÇΓöÇ PHASE 3: Poll until Gemini is done ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        while True:
            status = parser.client.batches.get(name=batch_job.name)
            if status.state.name in ("JOB_STATE_SUCCEEDED", "JOB_STATE_FAILED", "JOB_STATE_CANCELLED"):
                break
            time.sleep(30)  # worker is blocked here ΓÇö acceptable for a bulk job

        if status.state.name != "JOB_STATE_SUCCEEDED":
            for cid in ready_ids:
                c_map[cid].processing_status = "failed"
                c_map[cid].processing_error = f"Gemini batch failed: {status.error}"
            db.commit()
            return

        # ΓöÇΓöÇ PHASE 4: Download + parse results ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        raw_bytes = parser.client.files.download(file=status.dest.file_name)
        llm_results = {}  # candidate_id -> {"skills": [...], ...}
        for line in raw_bytes.decode("utf-8").splitlines():
            if not line:
                continue
            row = json.loads(line)
            cid = int(row["key"])
            try:
                # response text is nested inside the Gemini response structure
                text = row["response"]["candidates"][0]["content"]["parts"][0]["text"]
                llm_results[cid] = json.loads(text)
            except Exception:
                llm_results[cid] = None

        c_map = {c.id: c for c in candidates}
        for cid in ready_ids:
            c = c_map[cid]
            data = llm_results.get(cid)
            if not data or not isinstance(data, dict):
                c.processing_status = "failed"
                c.processing_error = "LLM returned invalid data"
                continue
            c.parsed_skills = data.get("skills", [])
            c.raw_text = parsed_texts[cid]
        db.commit()

        # ΓöÇΓöÇ PHASE 5: Batch embed (one forward pass per text type) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        embeddable = [c for c in candidates if c.processing_status == "processing"]
        raw_texts   = [c.raw_text for c in embeddable]
        skill_texts = [" ".join(c.parsed_skills) for c in embeddable]

        with ThreadPoolExecutor(max_workers=2) as ex:
            f_resume = ex.submit(embedding_service.model.encode, raw_texts)
            f_skills = ex.submit(embedding_service.model.encode, skill_texts)
            resume_vecs = f_resume.result()
            skills_vecs = f_skills.result()

        # ΓöÇΓöÇ PHASE 6: Score each candidate ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        job = db.get(models.JobPosting, job_id)
        for c, rv, sv in zip(embeddable, resume_vecs, skills_vecs):
            try:
                c.resume_vector = rv.tolist()
                c.candidate_skills_vector = sv.tolist()
                scores = scorer.calculate_match(
                    job_embedding=job.job_vector,
                    candidate_embedding=c.resume_vector,
                    job_requirements_embedding=job.skills_vector,
                    candidate_skills_embedding=c.candidate_skills_vector,
                    job_skills=job.required_skills,
                    candidate_text=c.raw_text,
                    candidate_skills=c.parsed_skills,
                )
                c.matched_skills  = scores["matched_skills"]
                c.context_score   = scores["context_score"]
                c.semantic_score  = scores["skills_semantic_score"]
                c.keyword_score   = scores["keyword_score"]
                c.total_weighted_score = scores["total_score"]
                c.processing_status = "ready"
            except ScoringError as exc:
                c.processing_status = "failed"
                c.processing_error = str(exc)

        db.commit()

from typing import List, Dict
import numpy as np
from backend.services.util import cos_sim


class ScoringError(Exception):
    pass


class ScoringService:
    def calculate_match(self, job_embedding: List[float], candidate_embedding: List[float], job_requirements_embedding: List[float], candidate_skills_embedding: List[float], job_skills: List[str], candidate_text: str, candidate_skills: List[str] | None = None) -> Dict[str, float | list[str]]:
        """
        Scoring breakdown:
        - Semantic skills match: 60%
        - Context match: 20%
        - Keyword match: 20%
        """
        try:
            skills_score = self._cosine_score(job_requirements_embedding, candidate_skills_embedding, label="skills")
            context_score = self._cosine_score(job_embedding, candidate_embedding, label="context")
            keyword_score, matched_skills = self._keyword_score(job_skills, candidate_text, candidate_skills=candidate_skills)
        except Exception as exc:
            raise ScoringError("Candidate scoring failed") from exc

        final_score = (skills_score * 0.33 + context_score * 0.33 + keyword_score * 0.33)

        return {
            "total_score": round(final_score, 4),
            "skills_semantic_score": round(skills_score, 4),
            "context_score": round(context_score, 4),
            "keyword_score": round(keyword_score, 4),
            "matched_skills": matched_skills,
        }

    def _cosine_score(self, v1, v2, *, label: str) -> float:
        # Convert to plain numpy arrays first — pgvector returns custom types
        # that raise "truth value of array is ambiguous" with bare `if not v1`
        try:
            a = np.asarray(v1, dtype=float)
            b = np.asarray(v2, dtype=float)
        except Exception as exc:
            raise ScoringError(f"Could not convert {label} embedding to array") from exc

        if a.size == 0 or b.size == 0:
            raise ScoringError(f"Missing {label} embedding")

        if a.shape != b.shape:
            raise ScoringError(f"{label} embedding dimension mismatch: {a.shape} vs {b.shape}")

        score_matrix = cos_sim(a, b)
        # print(f"Score matrix is {score_matrix}")

        try:
            score = float(score_matrix[0][0])
        except Exception as exc:
            raise ScoringError(f"Invalid cosine similarity output for {label}") from exc

        # clamp to [0, 1]
        return max(0.0, min(score, 1.0))

    def _keyword_score(self, job_skills: List[str], candidate_text: str, candidate_skills: List[str] | None = None) -> tuple[float, list[str]]:
        if not job_skills:
            return 0.0, []

        # Build a combined search corpus:
        # 1. Raw resume text (exact substring match)
        # 2. LLM-parsed candidate skill terms joined as a searchable blob
        # This handles cases where required_skills are long prose phrases that
        # would never appear verbatim in a resume but individual terms do.
        corpora = []
        if candidate_text:
            corpora.append(candidate_text.lower())
        if candidate_skills:
            corpora.append(" ".join(candidate_skills).lower())
        combined = " | ".join(corpora)  # join so a skill can't span the boundary

        if not combined:
            return 0.0, []

        matched = [s for s in job_skills if s.lower() in combined]

        return len(matched) / len(job_skills), matched

scorer = ScoringService()
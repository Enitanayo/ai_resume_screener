from typing import List, Dict
from backend.services.util import cos_sim


class ScoringError(Exception):
    pass


class ScoringService:
    def calculate_match(self, job_embedding: List[float], candidate_embedding: List[float], job_requirements_embedding: List[float], candidate_skills_embedding: List[float], job_skills: List[str], candidate_text: str,) -> Dict[str, float | list[str]]:
        """
        Scoring breakdown:
        - Semantic skills match: 60%
        - Context match: 20%
        - Keyword match: 20%
        """
        try:
            skills_score = self._cosine_score(job_requirements_embedding, candidate_skills_embedding, label="skills")
            context_score = self._cosine_score(job_embedding, candidate_embedding, label="context")
            keyword_score, matched_skills = self._keyword_score(job_skills, candidate_text)
        except Exception as exc:
            raise ScoringError("Candidate scoring failed") from exc

        final_score = (skills_score * 0.6 + context_score * 0.2 + keyword_score * 0.2)

        return {
            "total_score": round(final_score, 4),
            "skills_semantic_score": round(skills_score, 4),
            "context_score": round(context_score, 4),
            "keyword_score": round(keyword_score, 4),
            "matched_skills": matched_skills,
        }

    def _cosine_score(self, v1: List[float], v2: List[float], *, label: str) -> float:
        if not v1 or not v2:
            raise ScoringError(f"Missing {label} embedding")

        if len(v1) != len(v2):
            raise ScoringError(f"{label} embedding dimension mismatch")

        score_matrix = cos_sim(v1, v2)
        print(f"Score matrix is {score_matrix}")

        try:
            score = float(score_matrix[0][0])
        except Exception as exc:
            raise ScoringError(f"Invalid cosine similarity output for {label}") from exc

        # clamp to [0, 1]
        return max(0.0, min(score, 1.0))

    def _keyword_score(self, job_skills: List[str], candidate_text: str,) -> tuple[float, list[str]]:
        if not job_skills or not candidate_text:
            return 0.0, []

        text = candidate_text.lower()
        matched = [s for s in job_skills if s.lower() in text]

        return len(matched) / len(job_skills), matched
    
scorer = ScoringService()
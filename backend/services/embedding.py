import openai
from typing import List

from backend.config import settings

class EmbeddingError(Exception):
    pass

class EmbeddingService:
    def __init__(self):
        self.provider = settings.embedding_provider
        self.model = None
        
        if self.provider == "openai" and settings.openai_api_key:
            openai.api_key = settings.openai_api_key
        else:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer('all-MiniLM-L6-v2')

    def generate_embedding(self, text: str) -> List[float]:
        if not text:
            raise EmbeddingError("NO TEXT PROVIDED FOR EMBEDDING")
            
        try:
            if self.provider == "openai" and settings.openai_api_key:
                text = text.replace("\n", " ")
                return openai.Embedding.create(
                    input=[text],
                    model="text-embedding-ada-002",
                )["data"][0]["embedding"]

            if self.model:
                embedding = self.model.encode(text)
                return embedding.tolist()

            raise EmbeddingError("No embedding provider configured")

        except Exception as exc:
            raise EmbeddingError("Could not generate embedding") from exc

    def get_dimension(self) -> int:
        if self.provider == "openai" and settings.openai_api_key:
            return 1536
        return 384

embedding_service = EmbeddingService()

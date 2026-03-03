import openai
from typing import List

from backend.config import settings

class EmbeddingError(Exception):
    pass

class EmbeddingService:
    def __init__(self):
        self.provider = settings.embedding_provider
        self.model = None
        self.gemini_client = None
        
        if self.provider == "openai" and settings.openai_api_key:
            openai.api_key = settings.openai_api_key
        elif self.provider == "gemini" and settings.gemini_api_key:
            try:
                from google import genai
                self.gemini_client = genai.Client(api_key=settings.gemini_api_key)
                print("Successfully initialized Gemini embedding client.")
            except ImportError:
                print("Warning: google-genai not installed.")
            except Exception as e:
                print(f"Warning: Failed to initialize Gemini client: {e}")
        else:
            try:
                from sentence_transformers import SentenceTransformer
                self.model = SentenceTransformer('all-MiniLM-L6-v2')
                print("Successfully loaded SentenceTransformer model.")
            except Exception as e:
                print(f"Warning: Failed to load local embedding model: {e}")

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

            if self.provider == "gemini" and self.gemini_client:
                result = self.gemini_client.models.embed_content(
                    model="models/gemini-embedding-001",
                    contents=text
                )
                return result.embeddings[0].values

            if self.model:
                embedding = self.model.encode(text)
                return embedding.tolist()

            raise EmbeddingError(f"No embedding provider configured or model failed to load. Provider: {self.provider}")

        except Exception as exc:
            print(f"CRITICAL EMBEDDING ERROR: {exc}")
            raise EmbeddingError(f"Could not generate embedding: {str(exc)}") from exc

    def get_dimension(self) -> int:
        if self.provider == "openai" and settings.openai_api_key:
            return 1536
        if self.provider == "gemini":
            return 3072
        return 384

embedding_service = EmbeddingService()
# from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict( env_file=".env", env_file_encoding= "utf-8")

    database_url: str
    secret_key: str
    embedding_provider: str
    openai_api_key: str
    redis_url: str
    gemini_api_key: str
    algorithm:str = "HS256"
    access_token_expires_minutes: int = 30

settings = Settings()
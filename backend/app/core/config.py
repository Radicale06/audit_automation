from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    MISTRAL_API_KEY: str
    MISTRAL_MODEL: str = "mistral-large-latest"
    DATABASE_URL: str = "sqlite:///audit_automation.db"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    class Config:
        env_file = ".env"

settings = Settings()
from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    APP_NAME: str = "Personal Finance Analyzer"
    DATABASE_URL: str = "sqlite:///./finance.db"
    DEBUG: bool = True
    CORS_ORIGINS: str = ""

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")


@lru_cache()
def get_settings() -> Settings:
    return Settings()

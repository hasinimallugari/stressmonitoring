import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    GEMINI_API_KEY: Optional[str] = None
    AI_BASE_URL: str = "https://generativelanguage.googleapis.com/v1beta/openai/"
    AI_API_KEY: str = "mock_key"
    AI_MODEL: str = "gemini-1.5-flash"

    STT_BASE_URL: str = "https://api.openai.com/v1"
    STT_API_KEY: str = "mock_key"
    STT_MODEL: str = "whisper-1"

    CONTEXT_DUMP_DIR: str = "../context-dump"
    DATABASE_URL: str = "sqlite:///./mental_health.db"
    SYSTEM_PROMPT: str = (
        "You are an empathetic, intuitive Mental Health & Wellbeing AI Companion. "
        "You listen actively, provide supportive guidance, and help users track and improve their mental wellbeing. "
        "Use the provided context files and user database document to personalize your advice."
    )

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()

"""Application configuration via environment variables."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database — Set to SQLite for zero-config local development
    DATABASE_URL: str = "sqlite:///./smartplate.db"

    # AI Model
    YOLO_MODEL_PATH: str = "yolov8n.pt"
    GEMINI_API_KEY: str = ""

    # JWT
    SECRET_KEY: str = "smartplate-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    class Config:
        env_file = ".env"


settings = Settings()

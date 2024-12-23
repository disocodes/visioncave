from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path

class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Visioncave"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "BACKEND_CORS_ORIGINS",
            "http://localhost:3000,http://localhost:8000,https://*.app.github.dev,http://*.app.github.dev"
        ).split(",")
    ]
    
    # Database URLs with proper credentials management
    MONGODB_URL: str = os.getenv(
        "MONGODB_URL",
        "mongodb://localhost:27017/visioncave"
    )
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "visioncave")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "visioncave")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "postgres")  # Using container name
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "visioncave")
    
    @property
    def POSTGRES_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # JWT Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    if not SECRET_KEY and ENVIRONMENT == "production":
        raise ValueError("SECRET_KEY environment variable is required in production")
    elif not SECRET_KEY:
        SECRET_KEY = "development-secret-key-change-in-production"
        
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "11520"))  # 8 days
    
    # File Storage with absolute paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    MODEL_DIR: Path = BASE_DIR / "models"
    
    # Ensure directories exist
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    
    # Camera Settings
    DEFAULT_FRAME_RATE: int = int(os.getenv("DEFAULT_FRAME_RATE", "30"))
    DEFAULT_RESOLUTION: tuple = tuple(
        map(int, os.getenv("DEFAULT_RESOLUTION", "1280,720").split(","))
    )
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

# Validate settings
if settings.ENVIRONMENT == "production":
    assert settings.SECRET_KEY != "development-secret-key-change-in-production", \
        "Change the SECRET_KEY environment variable in production!"
    assert not settings.DEBUG, "DEBUG should be False in production!"

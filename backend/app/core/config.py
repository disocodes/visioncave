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
    
    @property
    def MONGODB_CONNECTION_URL(self) -> str:
        from urllib.parse import quote_plus, urlparse, urlunparse
        if '@' in self.MONGODB_URL:
            # Parse the URL
            parsed = urlparse(self.MONGODB_URL)
            # Extract credentials
            userpass = parsed.netloc.split('@')[0]
            if ':' in userpass:
                username, password = userpass.split(':')
                # URL encode the password
                encoded_password = quote_plus(password)
                # Reconstruct netloc with encoded password
                netloc = f"{username}:{encoded_password}@{parsed.netloc.split('@')[1]}"
                # Reconstruct URL
                return urlunparse(parsed._replace(netloc=netloc))
        return self.MONGODB_URL
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "visioncave")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "visioncave")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")  # Using localhost since we're connecting to containerized postgres
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "visioncave")
    
    @property
    def POSTGRES_URL(self) -> str:
        from urllib.parse import quote_plus
        password = quote_plus(self.POSTGRES_PASSWORD)
        return f"postgresql://{self.POSTGRES_USER}:{password}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
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
    
    # Redis Configuration
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")  # Using localhost since we're connecting to containerized redis
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))
    
    @property
    def REDIS_URL(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
    
    # Celery Configuration
    @property
    def CELERY_BROKER_URL(self) -> str:
        return os.getenv("CELERY_BROKER_URL", self.REDIS_URL)
    
    @property
    def CELERY_RESULT_BACKEND(self) -> str:
        return os.getenv("CELERY_RESULT_BACKEND", self.REDIS_URL)
    
    # Celery Task Settings
    CELERY_TASK_TRACK_STARTED: bool = True
    CELERY_TASK_TIME_LIMIT: int = 3600  # 1 hour
    CELERY_TASK_SOFT_TIME_LIMIT: int = 3600
    CELERY_WORKER_PREFETCH_MULTIPLIER: int = 1
    CELERY_WORKER_MAX_TASKS_PER_CHILD: int = 50

    # Model Settings
    USE_HUGGINGFACE_MODELS: bool = os.getenv("USE_HUGGINGFACE_MODELS", "true").lower() == "true"
    HUGGINGFACE_MODEL_MAPPING: dict = {
        "yolov5": "hustvl/yolos-tiny",  # YOLOS is HF's YOLO-like model
        "poseDetection": "microsoft/movenet-thunder",
        "faceDetection": "dlib/face-detection",
        "activityRecognition": "microsoft/resnet-50",
        "vehicleAnalysis": "microsoft/resnet-50",
        "ppeDetection": "microsoft/resnet-50",
        "anomalyDetection": "microsoft/resnet-50"
    }
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

# Validate settings
if settings.ENVIRONMENT == "production":
    assert settings.SECRET_KEY != "development-secret-key-change-in-production", \
        "Change the SECRET_KEY environment variable in production!"
    assert not settings.DEBUG, "DEBUG should be False in production!"

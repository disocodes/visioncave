from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from enum import Enum

class StorageProvider(str, Enum):
    LOCAL = "local"
    GOOGLE_DRIVE = "google-drive"
    AWS_S3 = "aws-s3"
    NEXTCLOUD = "nextcloud"

class StorageConfig(BaseModel):
    provider: StorageProvider
    credentials: Optional[dict] = None
    bucket_name: Optional[str] = None
    base_path: Optional[str] = None
    retention_days: Optional[int] = None
    max_storage_gb: Optional[float] = None

class VLMConfig(BaseModel):
    enabled: bool = False
    model_name: str
    confidence_threshold: float = 0.5
    custom_model_path: Optional[str] = None
    parameters: Optional[dict] = None

class ModelType(str, Enum):
    OPENCV = "opencv"
    YOLO = "yolo"
    CUSTOM = "custom"
    VLM = "vlm"

class ModelConfig(BaseModel):
    id: str
    name: str
    type: ModelType
    description: Optional[str] = None
    version: Optional[str] = None
    parameters: Optional[dict] = None
    confidence_threshold: float = 0.5

class RecordingBase(BaseModel):
    name: str
    file_path: str
    owner_id: int

class RecordingCreate(RecordingBase):
    pass

class Recording(RecordingBase):
    id: int
    created_at: datetime
    applied_tasks: Optional[List[dict]] = None

    class Config:
        orm_mode = True

class TaskResult(BaseModel):
    model_id: str
    confidence: float
    detections: List[dict]
    timestamp: datetime

class Task(BaseModel):
    id: int
    name: str
    status: str
    recording_id: int
    model_id: str
    results: Optional[List[TaskResult]] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        orm_mode = True

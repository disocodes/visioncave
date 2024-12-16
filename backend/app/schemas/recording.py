from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

class TaskInfo(BaseModel):
    id: int
    name: str
    status: str
    results: Optional[Dict] = None

class RecordingBase(BaseModel):
    name: str
    file_path: str
    camera_id: Optional[int] = None
    retention_period: Optional[int] = None  # in days
    storage_provider: Optional[str] = None  # 'local', 's3', etc.

class RecordingCreate(RecordingBase):
    user_id: int

class RecordingUpdate(BaseModel):
    name: Optional[str] = None
    retention_period: Optional[int] = None
    storage_provider: Optional[str] = None
    storage_settings: Optional[Dict] = None

class RecordingResponse(RecordingBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    user_id: int
    applied_tasks: Optional[List[TaskInfo]] = []

    class Config:
        from_attributes = True

class RecordingSettings(BaseModel):
    retention_period: Optional[int] = None  # in days
    storage_provider: Optional[str] = None
    credentials: Optional[Dict] = None
    recording_id: Optional[int] = None

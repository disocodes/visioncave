from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CameraBase(BaseModel):
    name: str
    url: str
    type: str  # 'ip', 'webcam', etc.
    location: Optional[str] = None
    description: Optional[str] = None

class CameraCreate(CameraBase):
    pass

class CameraUpdate(CameraBase):
    name: Optional[str] = None
    url: Optional[str] = None
    type: Optional[str] = None

class CameraResponse(CameraBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

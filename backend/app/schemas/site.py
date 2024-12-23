from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

class SiteBase(BaseModel):
    name: str
    location: Optional[str] = None
    type: str
    status: Optional[str] = "active"
    configuration: Optional[Dict[str, Any]] = {"widgets": []}

class SiteCreate(SiteBase):
    pass

class SiteUpdate(SiteBase):
    name: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    configuration: Optional[Dict[str, Any]] = None

class SiteResponse(SiteBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

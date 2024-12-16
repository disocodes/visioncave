from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SiteBase(BaseModel):
    name: str
    location: Optional[str] = None
    type: str

class SiteCreate(SiteBase):
    pass

class SiteUpdate(SiteBase):
    name: Optional[str] = None
    type: Optional[str] = None

class SiteResponse(SiteBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

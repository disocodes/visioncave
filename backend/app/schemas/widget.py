from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class MetricBase(BaseModel):
    label: str
    value: str

class MetricCreate(MetricBase):
    widget_id: int

class MetricResponse(MetricBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AlertBase(BaseModel):
    message: str
    severity: str  # low, medium, high
    status: str = "active"  # active, acknowledged, resolved

class AlertCreate(AlertBase):
    widget_id: int

class AlertResponse(AlertBase):
    id: int
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WidgetBase(BaseModel):
    name: str
    type: str  # e.g., 'analytics', 'camera', 'security', etc.
    config: Optional[Dict[str, Any]] = None
    description: Optional[str] = None
    position: Optional[Dict[str, Any]] = Field(default_factory=lambda: {"x": 0, "y": 0, "w": 1, "h": 1})
    module: Optional[str] = None
    status: str = "active"

class WidgetCreate(WidgetBase):
    site_id: int
    owner_id: int
    order: Optional[float] = None

class WidgetUpdate(BaseModel):
    name: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    description: Optional[str] = None
    position: Optional[Dict[str, Any]] = None
    order: Optional[float] = None
    status: Optional[str] = None

class WidgetPositionUpdate(BaseModel):
    position: Dict[str, Any]
    order: float

class WidgetResponse(WidgetBase):
    id: int
    site_id: int
    owner_id: int
    order: Optional[float]
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_data_update: Optional[datetime] = None
    metrics: List[MetricResponse] = []
    alerts: List[AlertResponse] = []

    class Config:
        from_attributes = True

class WidgetSummary(BaseModel):
    metrics: List[MetricBase]
    alerts: List[AlertBase]

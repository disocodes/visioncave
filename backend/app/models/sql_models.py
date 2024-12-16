from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Recording(Base):
    __tablename__ = "recordings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    file_path = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True, onupdate=datetime.utcnow)
    retention_period = Column(Integer, nullable=True)  # in days
    storage_provider = Column(String, nullable=True)  # local, s3, etc.
    
    # Relationships
    owner = relationship("User", back_populates="recordings")
    camera = relationship("Camera", back_populates="recordings")
    applied_tasks = relationship("Task", back_populates="recording")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    recording_id = Column(Integer, ForeignKey("recordings.id"))
    status = Column(String)  # pending, running, completed, failed
    results = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    recording = relationship("Recording", back_populates="applied_tasks")

class Widget(Base):
    __tablename__ = "widgets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)  # camera_stream, analytics, alert, etc.
    config = Column(JSON)  # Widget-specific configuration
    description = Column(String, nullable=True)
    position = Column(JSON)  # {x, y, w, h} for layout
    order = Column(Float)  # For drag and drop ordering
    module = Column(String)  # residential, school, hospital, etc.
    status = Column(String)  # active, inactive, error
    site_id = Column(Integer, ForeignKey("sites.id"))
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True, onupdate=datetime.utcnow)
    last_data_update = Column(DateTime, nullable=True)  # For tracking when widget data was last updated
    
    # Relationships
    owner = relationship("User", back_populates="widgets")
    site = relationship("Site")
    metrics = relationship("WidgetMetric", back_populates="widget")
    alerts = relationship("WidgetAlert", back_populates="widget")

class WidgetMetric(Base):
    __tablename__ = "widget_metrics"

    id = Column(Integer, primary_key=True, index=True)
    widget_id = Column(Integer, ForeignKey("widgets.id"))
    label = Column(String)
    value = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    widget = relationship("Widget", back_populates="metrics")

class WidgetAlert(Base):
    __tablename__ = "widget_alerts"

    id = Column(Integer, primary_key=True, index=True)
    widget_id = Column(Integer, ForeignKey("widgets.id"))
    message = Column(String)
    severity = Column(String)  # low, medium, high
    status = Column(String)  # active, acknowledged, resolved
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    
    # Relationships
    widget = relationship("Widget", back_populates="alerts")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    widgets = relationship("Widget", back_populates="owner")
    recordings = relationship("Recording", back_populates="owner")

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    url = Column(String)
    type = Column(String)  # ip, webcam, etc.
    status = Column(String)  # active, inactive, error
    config = Column(JSON)  # Camera-specific configuration
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    recordings = relationship("Recording", back_populates="camera")

class Site(Base):
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    type = Column(String)  # residential, school, hospital, etc.
    created_at = Column(DateTime, default=datetime.utcnow)

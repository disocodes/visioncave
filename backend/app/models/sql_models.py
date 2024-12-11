from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    phone = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    organization = relationship("Organization", back_populates="users")
    cameras = relationship("Camera", back_populates="owner")
    widgets = relationship("Widget", back_populates="owner")
    roles = relationship("Role", secondary="user_roles")

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    subscription_type = Column(String)  # basic, premium, enterprise
    subscription_status = Column(String)  # active, expired, trial
    subscription_expiry = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    sites = relationship("Site", back_populates="organization")
    users = relationship("User", back_populates="organization")

class Site(Base):
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    address = Column(String)
    location = Column(JSON)  # {latitude, longitude}
    type = Column(String)  # office, school, hospital, etc.
    status = Column(String)  # active, inactive, maintenance
    timezone = Column(String)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    organization = relationship("Organization", back_populates="sites")
    cameras = relationship("Camera", back_populates="site")
    zones = relationship("Zone", back_populates="site")

class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    type = Column(String)  # entrance, exit, restricted, etc.
    site_id = Column(Integer, ForeignKey("sites.id"))
    configuration = Column(JSON)  # zone-specific settings
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    site = relationship("Site", back_populates="zones")
    cameras = relationship("Camera", secondary="zone_cameras")

class ZoneCamera(Base):
    __tablename__ = "zone_cameras"

    zone_id = Column(Integer, ForeignKey("zones.id"), primary_key=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"), primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    permissions = Column(JSON)  # list of permissions
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    users = relationship("User", secondary="user_roles")

class UserRole(Base):
    __tablename__ = "user_roles"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    role_id = Column(Integer, ForeignKey("roles.id"), primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    url = Column(String)
    type = Column(String)  # IP, USB, RTSP, etc.
    location = Column(String)
    status = Column(String)  # active, inactive, error
    configuration = Column(JSON)
    owner_id = Column(Integer, ForeignKey("users.id"))
    site_id = Column(Integer, ForeignKey("sites.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="cameras")
    site = relationship("Site", back_populates="cameras")
    streams = relationship("Stream", back_populates="camera")
    zones = relationship("Zone", secondary="zone_cameras")

class Widget(Base):
    __tablename__ = "widgets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)  # camera_stream, analytics, alert, etc.
    configuration = Column(JSON)
    position = Column(JSON)  # {x, y, w, h}
    module = Column(String)  # residential, school, hospital, etc.
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="widgets")

class Stream(Base):
    __tablename__ = "streams"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"))
    status = Column(String)  # active, inactive, error
    frame_rate = Column(Integer)
    resolution = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    camera = relationship("Camera", back_populates="streams")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, unique=True, index=True)
    name = Column(String)
    class_id = Column(Integer, ForeignKey("classes.id"))
    status = Column(String)  # present, absent
    last_seen = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    class_ = relationship("Class", back_populates="students")
    attendance_records = relationship("AttendanceRecord", back_populates="student")

class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    grade = Column(String)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    camera_id = Column(Integer, ForeignKey("cameras.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    teacher = relationship("User")
    camera = relationship("Camera")
    students = relationship("Student", back_populates="class_")
    attention_records = relationship("AttentionRecord", back_populates="class_")

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    date = Column(DateTime)
    status = Column(String)  # present, absent, late
    entry_time = Column(DateTime, nullable=True)
    exit_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    student = relationship("Student", back_populates="attendance_records")

class AttentionRecord(Base):
    __tablename__ = "attention_records"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"))
    timestamp = Column(DateTime)
    attention_level = Column(Integer)  # 0-100
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    class_ = relationship("Class", back_populates="attention_records")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    room_number = Column(String)
    condition = Column(String)  # stable, critical, etc.
    status = Column(String)  # normal, warning, critical
    site_id = Column(Integer, ForeignKey("sites.id"))
    zone_id = Column(Integer, ForeignKey("zones.id"))
    last_seen = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    site = relationship("Site")
    zone = relationship("Zone")
    monitoring_records = relationship("PatientMonitoringRecord", back_populates="patient")
    alerts = relationship("MedicalAlert", back_populates="patient")

class PatientMonitoringRecord(Base):
    __tablename__ = "patient_monitoring_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    timestamp = Column(DateTime)
    location = Column(JSON)  # {zone_id, coordinates}
    vital_signs = Column(JSON)  # {heart_rate, blood_pressure, etc.}
    status = Column(String)  # normal, warning, critical
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    patient = relationship("Patient", back_populates="monitoring_records")

class MedicalAlert(Base):
    __tablename__ = "medical_alerts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    alert_type = Column(String)  # fall_detection, emergency_call, etc.
    severity = Column(String)  # low, medium, high
    status = Column(String)  # active, acknowledged, resolved
    location = Column(JSON)  # {zone_id, coordinates}
    details = Column(JSON)  # Additional alert details
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    
    # Relationships
    patient = relationship("Patient", back_populates="alerts")
    responses = relationship("AlertResponse", back_populates="alert")

class AlertResponse(Base):
    __tablename__ = "alert_responses"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("medical_alerts.id"))
    responder_id = Column(Integer, ForeignKey("users.id"))
    response_time = Column(DateTime)
    action_taken = Column(String)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    alert = relationship("MedicalAlert", back_populates="responses")
    responder = relationship("User")

class StaffLocation(Base):
    __tablename__ = "staff_locations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    site_id = Column(Integer, ForeignKey("sites.id"))
    zone_id = Column(Integer, ForeignKey("zones.id"))
    status = Column(String)  # active, break, off-duty
    location = Column(JSON)  # {zone_id, coordinates}
    last_updated = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    site = relationship("Site")
    zone = relationship("Zone")

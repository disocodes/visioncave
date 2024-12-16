from sqlalchemy.orm import Session
from ..models.sql_models import User, Recording, Task, Site
from datetime import datetime
import os

def init_test_data(db: Session):
    """Initialize test data in the database."""
    
    # Create test user if not exists
    test_user = db.query(User).filter(User.username == "test_user").first()
    if not test_user:
        test_user = User(
            username="test_user",
            email="test@example.com",
            hashed_password="mock_hashed_password",
            is_active=True
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)

    # Create test hospital site if not exists
    test_hospital = db.query(Site).filter(Site.name == "Test Hospital").first()
    if not test_hospital:
        test_hospital = Site(
            name="Test Hospital",
            location="123 Medical Center Dr",
            type="hospital"
        )
        db.add(test_hospital)
        db.commit()
        db.refresh(test_hospital)

    # Create test residential site if not exists
    test_residential = db.query(Site).filter(Site.name == "Test Residence").first()
    if not test_residential:
        test_residential = Site(
            name="Test Residence",
            location="456 Home Ave",
            type="residential"
        )
        db.add(test_residential)
        db.commit()
        db.refresh(test_residential)

    # Create test recording if not exists
    test_recording = db.query(Recording).filter(Recording.name == "Test Recording").first()
    if not test_recording:
        # Create recordings directory if it doesn't exist
        recordings_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "recordings")
        os.makedirs(recordings_dir, exist_ok=True)
        
        # Create an empty file as a placeholder
        file_path = os.path.join(recordings_dir, "test_recording.mp4")
        if not os.path.exists(file_path):
            open(file_path, 'a').close()  # Create empty file
        
        test_recording = Recording(
            name="Test Recording",
            file_path=file_path,
            owner_id=test_user.id,
            created_at=datetime.utcnow(),
            storage_provider="local"
        )
        db.add(test_recording)
        db.commit()
        db.refresh(test_recording)

        # Add a test task for the recording
        test_task = Task(
            name="Object Detection",
            recording_id=test_recording.id,
            status="completed",
            results={"objects_detected": 5},
            created_at=datetime.utcnow(),
            completed_at=datetime.utcnow()
        )
        db.add(test_task)
        db.commit()

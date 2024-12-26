from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from ..models.sql_models import User, Recording, Task, Site
from datetime import datetime
import os
from passlib.context import CryptContext
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_test_data(db: Session):
    """Initialize test data in the database with proper error handling."""
    try:
        # Create test user if not exists
        test_user = db.query(User).filter(User.username == "test_user").first()
        if not test_user:
            hashed_password = pwd_context.hash("test_password")
            test_user = User(
                username="test_user",
                email="test@example.com",
                hashed_password=hashed_password,
                is_active=True
            )
            db.add(test_user)
            try:
                db.commit()
                db.refresh(test_user)
                logger.info("Test user created successfully")
            except SQLAlchemyError as e:
                db.rollback()
                logger.error(f"Error creating test user: {str(e)}")
                raise

        # Create development site if not exists
        dev_site = db.query(Site).filter(Site.name == "Development Site").first()
        if not dev_site:
            dev_site = Site(
                id=1,  # Explicitly set id to match frontend DEV_SITE
                name="Development Site",
                location="Local Environment",
                type="development",
                status="active",
                configuration={"widgets": []}
            )
            db.add(dev_site)
            try:
                db.commit()
                db.refresh(dev_site)
                logger.info("Development site created successfully")
            except SQLAlchemyError as e:
                db.rollback()
                logger.error(f"Error creating development site: {str(e)}")
                raise

        # Create test mine site if not exists
        test_mine = db.query(Site).filter(Site.name == "Test Mine").first()
        if not test_mine:
            test_mine = Site(
                name="Test Mine",
                location="321 Mining Road",
                type="mine",
                status="active",
                configuration={"widgets": []}
            )
            db.add(test_mine)
            try:
                db.commit()
                db.refresh(test_mine)
                logger.info("Test mine site created successfully")
            except SQLAlchemyError as e:
                db.rollback()
                logger.error(f"Error creating test mine site: {str(e)}")
                raise

        # Create test hospital site if not exists
        test_hospital = db.query(Site).filter(Site.name == "Test Hospital").first()
        if not test_hospital:
            test_hospital = Site(
                name="Test Hospital",
                location="123 Medical Center Dr",
                type="hospital",
                status="active",
                configuration={"widgets": []}
            )
            db.add(test_hospital)
            try:
                db.commit()
                db.refresh(test_hospital)
                logger.info("Test hospital site created successfully")
            except SQLAlchemyError as e:
                db.rollback()
                logger.error(f"Error creating test hospital site: {str(e)}")
                raise

        # Create test residential site if not exists
        test_residential = db.query(Site).filter(Site.name == "Test Residence").first()
        if not test_residential:
            test_residential = Site(
                name="Test Residence",
                location="456 Home Ave",
                type="residential",
                status="active",
                configuration={"widgets": []}
            )
            db.add(test_residential)
            try:
                db.commit()
                db.refresh(test_residential)
                logger.info("Test residential site created successfully")
            except SQLAlchemyError as e:
                db.rollback()
                logger.error(f"Error creating test residential site: {str(e)}")
                raise

        # Create test school site if not exists
        test_school = db.query(Site).filter(Site.name == "Test School").first()
        if not test_school:
            test_school = Site(
                name="Test School",
                location="789 Education Blvd",
                type="school",
                status="active",
                configuration={"widgets": []}
            )
            db.add(test_school)
            try:
                db.commit()
                db.refresh(test_school)
                logger.info("Test school site created successfully")
            except SQLAlchemyError as e:
                db.rollback()
                logger.error(f"Error creating test school site: {str(e)}")
                raise

        # Create test recording if not exists
        test_recording = db.query(Recording).filter(Recording.name == "Test Recording").first()
        if not test_recording:
            try:
                # Create recordings directory if it doesn't exist
                recordings_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "recordings")
                os.makedirs(recordings_dir, exist_ok=True)
                
                # Create an empty file as a placeholder with proper permissions
                file_path = os.path.join(recordings_dir, "test_recording.mp4")
                if not os.path.exists(file_path):
                    with open(file_path, 'wb') as f:
                        f.write(b'')  # Create empty file
                    # Set proper file permissions (readable/writable by owner only)
                    os.chmod(file_path, 0o600)
                
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
                logger.info("Test recording created successfully")

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
                logger.info("Test task created successfully")

            except OSError as e:
                logger.error(f"File system error: {str(e)}")
                raise
            except SQLAlchemyError as e:
                db.rollback()
                logger.error(f"Database error: {str(e)}")
                raise

    except Exception as e:
        logger.error(f"Unexpected error in init_test_data: {str(e)}")
        raise

    logger.info("Test data initialization completed successfully")

from typing import Generator
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from ..models.sql_models import Base, User
import logging
import os
from .config import settings

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create PostgreSQL connection
engine = create_engine(
    settings.POSTGRES_URL,
    pool_pre_ping=True
)

# Create tables
Base.metadata.create_all(bind=engine)

# Database dependency
def get_db() -> Generator:
    db = Session(engine)
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {str(e)}")
        raise
    finally:
        db.close()

# Authentication dependency
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    try:
        # For development, create a test user if it doesn't exist
        test_user = db.query(User).filter(User.username == "test_user").first()
        if not test_user:
            from passlib.context import CryptContext
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            
            test_user = User(
                username="test_user",
                email="test@example.com",
                hashed_password=pwd_context.hash("test_password"),  # Properly hash the password
                is_active=True
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)
            logger.info("Created test user")
        
        return test_user
    except Exception as e:
        logger.error(f"Error in get_current_user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error accessing user data"
        )

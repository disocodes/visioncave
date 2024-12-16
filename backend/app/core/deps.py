from typing import Generator
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from ..models.sql_models import Base, User

# Create SQLite database engine
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# Database dependency
def get_db() -> Generator:
    db = Session(engine)
    try:
        yield db
    finally:
        db.close()

# Authentication dependency
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    # For development, create a test user if it doesn't exist
    test_user = db.query(User).filter(User.username == "test_user").first()
    if not test_user:
        test_user = User(
            username="test_user",
            email="test@example.com",
            hashed_password="mock_hashed_password",  # In production, use proper password hashing
            is_active=True
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
    
    return test_user

from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models.sql_models import User, Role, UserRole
from ..core.security import get_password_hash, verify_password
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class UserService:
    @staticmethod
    async def create_user(db: Session, user_data: Dict) -> User:
        """Create a new user."""
        try:
            # Check if user already exists
            if db.query(User).filter(User.email == user_data['email']).first():
                raise HTTPException(status_code=400, detail="Email already registered")
            
            if db.query(User).filter(User.username == user_data['username']).first():
                raise HTTPException(status_code=400, detail="Username already taken")

            # Create user
            user = User(
                email=user_data['email'],
                username=user_data['username'],
                hashed_password=get_password_hash(user_data['password']),
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                phone=user_data.get('phone'),
                organization_id=user_data['organization_id'],
                is_active=True,
                is_superuser=user_data.get('is_superuser', False)
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            # Assign roles if specified
            if 'roles' in user_data:
                await UserService.assign_roles(db, user.id, user_data['roles'])

            return user
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating user: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def get_user(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    async def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email."""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    async def authenticate_user(
        db: Session, email: str, password: str
    ) -> Optional[User]:
        """Authenticate a user."""
        user = await UserService.get_user_by_email(db, email)
        if not user or not verify_password(password, user.hashed_password):
            return None
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        
        return user

    @staticmethod
    async def update_user(
        db: Session, user_id: int, user_data: Dict
    ) -> Optional[User]:
        """Update user details."""
        user = await UserService.get_user(db, user_id)
        if not user:
            return None

        # Handle password update separately
        if 'password' in user_data:
            user_data['hashed_password'] = get_password_hash(user_data.pop('password'))

        for key, value in user_data.items():
            if key != 'roles':
                setattr(user, key, value)

        try:
            # Update roles if specified
            if 'roles' in user_data:
                await UserService.assign_roles(db, user.id, user_data['roles'])

            db.commit()
            db.refresh(user)
            return user
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating user: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def delete_user(db: Session, user_id: int) -> bool:
        """Delete a user."""
        user = await UserService.get_user(db, user_id)
        if not user:
            return False

        try:
            db.delete(user)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting user: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def list_users(
        db: Session, org_id: Optional[int] = None, skip: int = 0, limit: int = 100
    ) -> List[User]:
        """List all users, optionally filtered by organization."""
        query = db.query(User)
        if org_id:
            query = query.filter(User.organization_id == org_id)
        return query.offset(skip).limit(limit).all()

    @staticmethod
    async def create_role(db: Session, role_data: Dict) -> Role:
        """Create a new role."""
        try:
            role = Role(
                name=role_data['name'],
                description=role_data.get('description'),
                permissions=role_data.get('permissions', [])
            )
            db.add(role)
            db.commit()
            db.refresh(role)
            return role
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating role: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def assign_roles(db: Session, user_id: int, role_ids: List[int]) -> bool:
        """Assign roles to a user."""
        try:
            # Remove existing roles
            db.query(UserRole).filter(UserRole.user_id == user_id).delete()
            
            # Add new roles
            for role_id in role_ids:
                user_role = UserRole(user_id=user_id, role_id=role_id)
                db.add(user_role)
            
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"Error assigning roles: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def check_permission(
        db: Session, user_id: int, required_permission: str
    ) -> bool:
        """Check if a user has a specific permission."""
        user = await UserService.get_user(db, user_id)
        if not user:
            return False

        if user.is_superuser:
            return True

        for role in user.roles:
            if required_permission in role.permissions:
                return True

        return False

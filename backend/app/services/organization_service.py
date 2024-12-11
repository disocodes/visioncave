from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models.sql_models import Organization, Site, User
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class OrganizationService:
    @staticmethod
    async def create_organization(db: Session, org_data: Dict) -> Organization:
        """Create a new organization."""
        try:
            organization = Organization(
                name=org_data['name'],
                description=org_data.get('description'),
                subscription_type=org_data.get('subscription_type', 'basic'),
                subscription_status='active',
                subscription_expiry=org_data.get('subscription_expiry')
            )
            db.add(organization)
            db.commit()
            db.refresh(organization)
            return organization
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating organization: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def get_organization(db: Session, org_id: int) -> Optional[Organization]:
        """Get organization by ID."""
        return db.query(Organization).filter(Organization.id == org_id).first()

    @staticmethod
    async def update_organization(
        db: Session, org_id: int, org_data: Dict
    ) -> Optional[Organization]:
        """Update organization details."""
        organization = await OrganizationService.get_organization(db, org_id)
        if not organization:
            return None

        for key, value in org_data.items():
            setattr(organization, key, value)

        try:
            db.commit()
            db.refresh(organization)
            return organization
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating organization: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def delete_organization(db: Session, org_id: int) -> bool:
        """Delete an organization."""
        organization = await OrganizationService.get_organization(db, org_id)
        if not organization:
            return False

        try:
            db.delete(organization)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting organization: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def list_organizations(
        db: Session, skip: int = 0, limit: int = 100
    ) -> List[Organization]:
        """List all organizations."""
        return db.query(Organization).offset(skip).limit(limit).all()

    @staticmethod
    async def get_organization_sites(
        db: Session, org_id: int, skip: int = 0, limit: int = 100
    ) -> List[Site]:
        """Get all sites belonging to an organization."""
        return db.query(Site).filter(
            Site.organization_id == org_id
        ).offset(skip).limit(limit).all()

    @staticmethod
    async def get_organization_users(
        db: Session, org_id: int, skip: int = 0, limit: int = 100
    ) -> List[User]:
        """Get all users belonging to an organization."""
        return db.query(User).filter(
            User.organization_id == org_id
        ).offset(skip).limit(limit).all()

    @staticmethod
    async def check_subscription_status(db: Session, org_id: int) -> Dict:
        """Check organization's subscription status."""
        org = await OrganizationService.get_organization(db, org_id)
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")

        is_expired = False
        if org.subscription_expiry:
            is_expired = org.subscription_expiry < datetime.utcnow()

        return {
            'subscription_type': org.subscription_type,
            'subscription_status': org.subscription_status,
            'is_expired': is_expired,
            'expiry_date': org.subscription_expiry
        }

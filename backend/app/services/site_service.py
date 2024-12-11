from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models.sql_models import Site, Zone, Camera
import logging

logger = logging.getLogger(__name__)

class SiteService:
    @staticmethod
    async def create_site(db: Session, site_data: Dict) -> Site:
        """Create a new site."""
        try:
            site = Site(
                name=site_data['name'],
                description=site_data.get('description'),
                address=site_data['address'],
                location=site_data.get('location', {}),
                type=site_data['type'],
                status='active',
                timezone=site_data.get('timezone', 'UTC'),
                organization_id=site_data['organization_id']
            )
            db.add(site)
            db.commit()
            db.refresh(site)
            return site
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating site: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def get_site(db: Session, site_id: int) -> Optional[Site]:
        """Get site by ID."""
        return db.query(Site).filter(Site.id == site_id).first()

    @staticmethod
    async def update_site(
        db: Session, site_id: int, site_data: Dict
    ) -> Optional[Site]:
        """Update site details."""
        site = await SiteService.get_site(db, site_id)
        if not site:
            return None

        for key, value in site_data.items():
            setattr(site, key, value)

        try:
            db.commit()
            db.refresh(site)
            return site
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating site: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def delete_site(db: Session, site_id: int) -> bool:
        """Delete a site."""
        site = await SiteService.get_site(db, site_id)
        if not site:
            return False

        try:
            db.delete(site)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting site: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def list_sites(
        db: Session, org_id: Optional[int] = None, skip: int = 0, limit: int = 100
    ) -> List[Site]:
        """List all sites, optionally filtered by organization."""
        query = db.query(Site)
        if org_id:
            query = query.filter(Site.organization_id == org_id)
        return query.offset(skip).limit(limit).all()

    @staticmethod
    async def create_zone(db: Session, zone_data: Dict) -> Zone:
        """Create a new zone in a site."""
        try:
            zone = Zone(
                name=zone_data['name'],
                description=zone_data.get('description'),
                type=zone_data['type'],
                site_id=zone_data['site_id'],
                configuration=zone_data.get('configuration', {})
            )
            db.add(zone)
            db.commit()
            db.refresh(zone)
            return zone
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating zone: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def get_site_zones(
        db: Session, site_id: int, skip: int = 0, limit: int = 100
    ) -> List[Zone]:
        """Get all zones in a site."""
        return db.query(Zone).filter(
            Zone.site_id == site_id
        ).offset(skip).limit(limit).all()

    @staticmethod
    async def get_site_cameras(
        db: Session, site_id: int, skip: int = 0, limit: int = 100
    ) -> List[Camera]:
        """Get all cameras in a site."""
        return db.query(Camera).filter(
            Camera.site_id == site_id
        ).offset(skip).limit(limit).all()

    @staticmethod
    async def assign_camera_to_zone(
        db: Session, zone_id: int, camera_id: int
    ) -> bool:
        """Assign a camera to a zone."""
        try:
            zone = db.query(Zone).filter(Zone.id == zone_id).first()
            camera = db.query(Camera).filter(Camera.id == camera_id).first()

            if not zone or not camera:
                return False

            zone.cameras.append(camera)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"Error assigning camera to zone: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def get_site_status(db: Session, site_id: int) -> Dict:
        """Get comprehensive status of a site."""
        site = await SiteService.get_site(db, site_id)
        if not site:
            raise HTTPException(status_code=404, detail="Site not found")

        cameras = await SiteService.get_site_cameras(db, site_id)
        zones = await SiteService.get_site_zones(db, site_id)

        active_cameras = sum(1 for c in cameras if c.status == 'active')
        total_cameras = len(cameras)

        return {
            'site_status': site.status,
            'total_cameras': total_cameras,
            'active_cameras': active_cameras,
            'total_zones': len(zones),
            'type': site.type,
            'timezone': site.timezone
        }

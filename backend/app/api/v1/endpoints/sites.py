from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ....core.deps import get_db, get_current_user
from ....models.sql_models import Site, User
from ....schemas.site import SiteCreate, SiteUpdate, SiteResponse

router = APIRouter()

@router.post("/", response_model=SiteResponse)
async def create_site(
    site: SiteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_site = Site(
        name=site.name,
        location=site.location,
        type=site.type
    )
    db.add(db_site)
    db.commit()
    db.refresh(db_site)
    return db_site

@router.get("/", response_model=List[SiteResponse])
async def list_sites(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sites = db.query(Site).offset(skip).limit(limit).all()
    return sites

@router.get("/{site_id}", response_model=SiteResponse)
async def get_site(
    site_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site

@router.put("/{site_id}", response_model=SiteResponse)
async def update_site(
    site_id: int,
    site: SiteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_site = db.query(Site).filter(Site.id == site_id).first()
    if not db_site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    update_data = site.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_site, field, value)
    
    db.commit()
    db.refresh(db_site)
    return db_site

@router.delete("/{site_id}")
async def delete_site(
    site_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_site = db.query(Site).filter(Site.id == site_id).first()
    if not db_site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    db.delete(db_site)
    db.commit()
    return {"message": "Site deleted successfully"}

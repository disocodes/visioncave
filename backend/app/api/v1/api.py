from fastapi import APIRouter
from .endpoints import widgets, recordings, sites

api_router = APIRouter()

api_router.include_router(widgets.router, prefix="/widgets", tags=["widgets"])
api_router.include_router(recordings.router, prefix="/recordings", tags=["recordings"])
api_router.include_router(sites.router, prefix="/sites", tags=["sites"])

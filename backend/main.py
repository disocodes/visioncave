from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from app.api.v1.api import api_router
from app.core.deps import engine, get_db
from app.core.init_db import init_test_data
from app.models.sql_models import Base
from sqlalchemy.orm import Session
from app.routers import websocket
import json

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

# Include WebSocket router
app.include_router(websocket.router, prefix="/ws")

# Add token endpoint for authentication
@app.post("/token")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # For development, accept any credentials and return a token
    # In production, implement proper authentication
    token_data = {
        "access_token": "development_token",
        "token_type": "bearer"
    }
    return JSONResponse(
        content=token_data,
        headers={"Content-Type": "application/json"},
        media_type="application/json"
    )

# Initialize database and test data
@app.on_event("startup")
async def startup_event():
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
    # Initialize test data
    db = next(get_db())
    init_test_data(db)

# Add WebSocket CORS middleware for development
@app.middleware("http")
async def add_websocket_cors_headers(request, call_next):
    response = await call_next(request)
    if request.url.path.startswith("/ws"):
        response.headers["Access-Control-Allow-Origin"] = "*"
    return response

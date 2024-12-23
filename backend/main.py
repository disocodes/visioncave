from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from app.api.v1.api import api_router
from app.core.deps import engine, get_db
from app.core.init_db import init_test_data
from app.models.sql_models import Base
from sqlalchemy.orm import Session
from app.routers import websocket
from app.core.config import settings
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import json

limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        # Create database tables
        Base.metadata.create_all(bind=engine)
        
        # Initialize test data
        db = next(get_db())
        init_test_data(db)
    except Exception as e:
        print(f"Startup Error: {str(e)}")
        
    yield
    
    # Shutdown
    try:
        # Cleanup code here if needed
        pass
    except Exception as e:
        print(f"Shutdown Error: {str(e)}")

app = FastAPI(lifespan=lifespan)

# Configure CORS using settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error": str(exc) if settings.DEBUG else "An unexpected error occurred"
        }
    )

# Include API router
app.include_router(api_router, prefix="/api/v1")

# Include WebSocket router
app.include_router(websocket.router, prefix="/ws")

# Add token endpoint for authentication with rate limiting
@app.post("/token")
@limiter.limit("5/minute")
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # For development, accept test_user credentials
    if form_data.username == "test_user" and form_data.password == "test_password":
        return {
            "access_token": "development_token",
            "token_type": "bearer"
        }
    
    raise HTTPException(
        status_code=401,
        detail="Invalid credentials"
    )

# Add WebSocket CORS middleware for development
@app.middleware("http")
async def add_websocket_cors_headers(request, call_next):
    try:
        response = await call_next(request)
        if request.url.path.startswith("/ws"):
            response.headers["Access-Control-Allow-Origin"] = "*"  # For development
        return response
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error processing WebSocket request"}
        )

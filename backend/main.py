from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import uvicorn
from app.api.v1.endpoints import cameras, school, widgets, websockets

app = FastAPI(
    title="Visioncave API",
    description="Backend API for Visioncave Computer Vision Analytics Platform",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
Path("uploads").mkdir(exist_ok=True)
Path("models").mkdir(exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include API routes
app.include_router(cameras.router, prefix="/api/v1/cameras", tags=["cameras"])
app.include_router(school.router, prefix="/api/v1/school", tags=["school"])
app.include_router(widgets.router, prefix="/api/v1/widgets", tags=["widgets"])
app.include_router(websockets.router, prefix="/api/v1/ws", tags=["websockets"])

@app.get("/")
async def root():
    return {"message": "Welcome to Visioncave API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

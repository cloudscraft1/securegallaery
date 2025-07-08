#!/usr/bin/env python3
"""
Simple FastAPI server for debugging startup issues
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create simple app
app = FastAPI(title="VaultSecure Simple API")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Simple health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "VaultSecure Simple"
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "VaultSecure Simple API is running"}

@app.get("/api/")
async def api_root():
    """API root endpoint"""
    return {"message": "VaultSecure Simple API", "version": "1.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

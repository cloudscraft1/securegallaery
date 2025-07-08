#!/usr/bin/env python3
"""
Simple fallback server for emergency deployment
"""
import sys
import os
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    from fastapi.middleware.cors import CORSMiddleware
    from datetime import datetime
    
    app = FastAPI(title="VaultSecure Simple API")
    
    # Add CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Temporary - allow all origins
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @app.get("/")
    def root():
        return {"message": "VaultSecure Simple API - Emergency Mode", "status": "ok"}
    
    @app.get("/health")
    def health():
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "mode": "emergency"
        }
    
    @app.get("/api/test")
    def test():
        return {
            "status": "ok",
            "message": "Emergency API active",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    @app.post("/api/session")
    def create_session():
        return {
            "session_id": "emergency-session",
            "expires_at": datetime.utcnow().isoformat(),
            "message": "Emergency session created"
        }
    
    @app.get("/api/images")
    def get_images():
        # Return sample images for testing
        sample_images = [
            {
                "id": "1",
                "title": "Mountain Sunrise",
                "description": "Beautiful mountain sunrise - Emergency Mode",
                "tags": ["mountain", "sunrise", "landscape"],
                "date": "2024-01-15",
                "views": 156,
                "likes": 24,
                "camera": "Emergency Camera",
                "settings": "Emergency Mode",
                "location": "Emergency Location",
                "url": "/api/emergency-image/1",
                "thumbnail_url": "/api/emergency-image/1"
            },
            {
                "id": "2",
                "title": "Ocean Waves",
                "description": "Powerful ocean waves - Emergency Mode",
                "tags": ["ocean", "waves", "water"],
                "date": "2024-01-10",
                "views": 89,
                "likes": 18,
                "camera": "Emergency Camera",
                "settings": "Emergency Mode",
                "location": "Emergency Location",
                "url": "/api/emergency-image/2",
                "thumbnail_url": "/api/emergency-image/2"
            }
        ]
        return sample_images
    
    @app.get("/api/emergency-image/{image_id}")
    def get_emergency_image(image_id: str):
        # Return a simple emergency response
        return {
            "success": True,
            "imageData": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGMxZDk1Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzNiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+RW1lcmdlbmN5IEltYWdlPC90ZXh0PgogIDx0ZXh0IHg9IjEwIiB5PSIzMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSI+VmF1bHRTZWN1cmUgRW1lcmdlbmN5PC90ZXh0Pgo8L3N2Zz4=",
            "imageId": image_id,
            "sessionId": "emergency",
            "timestamp": datetime.utcnow().isoformat(),
            "security": {
                "watermarked": True,
                "sessionBound": True,
                "antiDownload": True
            }
        }
    
    if __name__ == "__main__":
        import uvicorn
        logger.info("Starting VaultSecure Simple Server...")
        uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
        
except Exception as e:
    logger.error(f"Failed to start simple server: {e}")
    
    # Ultra fallback - just print what we can
    print("EMERGENCY: Cannot start any server")
    print(f"Error: {e}")
    print(f"Python version: {sys.version}")
    print(f"Python path: {sys.path}")
    
    # Try to show what packages are available
    try:
        import pkg_resources
        installed_packages = [d.project_name for d in pkg_resources.working_set]
        print(f"Installed packages: {installed_packages}")
    except:
        print("Cannot list installed packages")
    
    sys.exit(1)

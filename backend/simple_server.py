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
        return []  # Return empty array for now
    
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

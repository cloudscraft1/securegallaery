#!/usr/bin/env python3
"""
Minimal test server to identify startup issues
"""
import sys
import os
import logging
from pathlib import Path

# Add the backend directory to Python path
sys.path.insert(0, '/app/backend')
sys.path.insert(0, '/app')

# Set up basic logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_imports():
    """Test all imports that might be causing issues"""
    try:
        logger.info("Testing basic imports...")
        
        # Test FastAPI
        from fastapi import FastAPI
        logger.info("✅ FastAPI import successful")
        
        # Test Pillow
        from PIL import Image, ImageDraw, ImageFont
        logger.info("✅ PIL import successful")
        
        # Test JWT
        import jwt
        logger.info("✅ JWT import successful")
        
        # Test other dependencies
        import uvicorn
        logger.info("✅ Uvicorn import successful")
        
        import requests
        logger.info("✅ Requests import successful")
        
        from pydantic import BaseModel
        logger.info("✅ Pydantic import successful")
        
        logger.info("✅ All imports successful!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Import error: {e}")
        return False

def test_directories():
    """Test directory creation and permissions"""
    try:
        logger.info("Testing directory creation...")
        
        # Test backend directory
        backend_dir = Path("/app/backend")
        logger.info(f"Backend directory exists: {backend_dir.exists()}")
        
        # Test images directory creation
        images_dir = backend_dir / "images" / "gallery"
        images_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Images directory created: {images_dir}")
        
        # Test write permissions
        test_file = images_dir / "test.txt"
        test_file.write_text("test")
        test_file.unlink()
        logger.info("✅ Write permissions OK")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Directory error: {e}")
        return False

def test_image_creation():
    """Test basic image creation"""
    try:
        logger.info("Testing image creation...")
        
        from PIL import Image, ImageDraw
        
        # Create a simple test image
        img = Image.new('RGB', (100, 100), color='red')
        draw = ImageDraw.Draw(img)
        
        # Try to load default font
        try:
            font = ImageFont.load_default()
            draw.text((10, 10), "Test", font=font, fill='white')
            logger.info("✅ Font loading successful")
        except Exception as font_error:
            logger.warning(f"Font loading failed: {font_error}")
            draw.rectangle([10, 10, 90, 90], fill='white')
            logger.info("✅ Fallback drawing successful")
        
        # Save test image
        images_dir = Path("/app/backend/images/gallery")
        test_image = images_dir / "test.jpg"
        img.save(test_image)
        logger.info(f"✅ Test image saved: {test_image}")
        
        # Clean up
        test_image.unlink()
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Image creation error: {e}")
        return False

def main():
    """Run all tests"""
    logger.info("🚀 Starting VaultSecure Test Server...")
    
    success = True
    
    # Test imports
    if not test_imports():
        success = False
    
    # Test directories
    if not test_directories():
        success = False
    
    # Test image creation
    if not test_image_creation():
        success = False
    
    if success:
        logger.info("✅ All tests passed! Server should be able to start.")
        
        # Try to import and start the actual server
        try:
            logger.info("Attempting to import main server...")
            from server import app
            logger.info("✅ Server import successful!")
            
            # Start a minimal server
            import uvicorn
            logger.info("Starting test server on port 8000...")
            uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
            
        except Exception as e:
            logger.error(f"❌ Server start failed: {e}")
            import traceback
            traceback.print_exc()
            
    else:
        logger.error("❌ Tests failed! Server cannot start.")
        sys.exit(1)

if __name__ == "__main__":
    main()

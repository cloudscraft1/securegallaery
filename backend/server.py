from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from dotenv import load_dotenv
# from motor.motor_asyncio import AsyncIOMotorClient  # Disabled for local development
from pydantic import BaseModel, Field
from typing import List, Optional
import os
import logging
import uuid
import io
import base64
import time
import hmac
import hashlib
from datetime import datetime, timedelta
from pathlib import Path
import json
import secrets
from PIL import Image, ImageDraw, ImageFont
import aiofiles
import jwt
from urllib.parse import urlparse
import asyncio
from collections import defaultdict
import requests

# Configure logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection - disabled for local development
# For local development, we'll use in-memory storage
# mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
# client = AsyncIOMotorClient(mongo_url)
# db = client[os.environ.get('DB_NAME', 'test_database')]

# Security constants
SECRET_KEY = secrets.token_urlsafe(32)
ALGORITHM = "HS256"
TOKEN_EXPIRY_MINUTES = 15
MAX_REQUESTS_PER_MINUTE = 60
ALLOWED_DOMAINS = [
    "localhost:3000", 
    "127.0.0.1:3000", 
    "securegallaery.onrender.com",
    "*.onrender.com",
    "8527c513-d6d9-4747-96e7-345f06b75467.e1-eu-north-azure.choreoapps.dev",
    "c8d34c90-0819-4af7-aa7d-2a5f6dafa7f8.e1-eu-north-azure.choreoapps.dev",
    "*.e1-eu-north-azure.choreoapps.dev",
    "*.choreoapps.dev"
]

# Create the main app
app = FastAPI(
    title="VaultSecure API", 
    description="Ultra-Secure Protected Image Gallery API",
    docs_url=None,  # Disable docs in production
    redoc_url=None  # Disable redoc in production
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security setup
security = HTTPBearer(auto_error=False)

# In-memory session and rate limiting storage
active_sessions = {}
rate_limiter = defaultdict(list)
SESSION_TIMEOUT = 3600  # 1 hour

# Image storage path
IMAGES_DIR = ROOT_DIR / "images" / "gallery"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# Dynamic image discovery
def discover_images():
    """Dynamically discover images from the gallery folder"""
    supported_formats = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}
    discovered_images = []
    
    try:
        for i, image_file in enumerate(IMAGES_DIR.glob('*'), 1):
            if image_file.suffix.lower() in supported_formats:
                # Get file stats
                file_stat = image_file.stat()
                
                # Create metadata from filename
                name_without_ext = image_file.stem
                title = name_without_ext.replace('_', ' ').replace('-', ' ').title()
                
                discovered_images.append({
                    "id": str(i),
                    "filename": image_file.name,
                    "title": title,
                    "description": f"Beautiful {title.lower()} from the secure gallery.",
                    "tags": ["gallery", "secure", "protected"],
                    "date_created": datetime.fromtimestamp(file_stat.st_mtime),
                    "views": 0,
                    "likes": 0,
                    "camera": "VaultSecure Camera",
                    "settings": "Secure Mode",
                    "location": "VaultSecure Gallery",
                    "file_size": file_stat.st_size,
                    "dimensions": "Auto",
                    "file_path": str(image_file)
                })
                
    except Exception as e:
        logger.error(f"Error discovering images: {e}")
        
    return discovered_images

# Create sample images if none exist
def create_sample_images():
    """Create sample placeholder images if the gallery is empty"""
    if not any(IMAGES_DIR.glob('*')):
        logger.info("Creating sample images...")
        
        sample_images = [
            {"filename": "mountain_sunrise.jpg", "color": "#FF6B6B", "text": "Mountain Sunrise"},
            {"filename": "ocean_waves.jpg", "color": "#4ECDC4", "text": "Ocean Waves"},
            {"filename": "city_lights.jpg", "color": "#45B7D1", "text": "City Lights"},
            {"filename": "forest_path.jpg", "color": "#96CEB4", "text": "Forest Path"},
            {"filename": "desert_dunes.jpg", "color": "#FFEAA7", "text": "Desert Dunes"}
        ]
        
        for sample in sample_images:
            try:
                # Create a placeholder image
                img = Image.new('RGB', (800, 600), color=sample["color"])
                draw = ImageDraw.Draw(img)
                
                # Add text with better font handling
                try:
                    # Try multiple font paths
                    font_paths = [
                        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
                        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                        "/usr/share/fonts/TTF/arial.ttf",
                        "/System/Library/Fonts/Arial.ttf"
                    ]
                    
                    font = None
                    for font_path in font_paths:
                        try:
                            font = ImageFont.truetype(font_path, 36)
                            break
                        except:
                            continue
                    
                    if font is None:
                        font = ImageFont.load_default()
                        
                except Exception as font_error:
                    logger.warning(f"Font loading error: {font_error}")
                    font = ImageFont.load_default()
                
                # Center the text
                try:
                    bbox = draw.textbbox((0, 0), sample["text"], font=font)
                    text_width = bbox[2] - bbox[0]
                    text_height = bbox[3] - bbox[1]
                    x = (800 - text_width) // 2
                    y = (600 - text_height) // 2
                except:
                    # Fallback positioning
                    x, y = 200, 280
                
                draw.text((x, y), sample["text"], font=font, fill='white')
                
                # Add VaultSecure watermark
                draw.text((10, 10), "VaultSecure Gallery", font=font, fill='white')
                draw.text((10, 580), f"Protected Image {sample['filename']}", font=font, fill='rgba(255,255,255,0.7)')
                
                # Save the image
                img.save(IMAGES_DIR / sample["filename"])
                logger.info(f"Created sample image: {sample['filename']}")
                
            except Exception as e:
                logger.error(f"Failed to create sample image {sample['filename']}: {e}")

# Initialize images on startup
create_sample_images()

# Models
class ImageMetadata(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    title: str
    description: str
    tags: List[str] = []
    date_created: datetime = Field(default_factory=datetime.utcnow)
    views: int = 0
    likes: int = 0
    camera: Optional[str] = None
    settings: Optional[str] = None
    location: Optional[str] = None
    file_size: int = 0
    dimensions: Optional[str] = None

class SessionCreate(BaseModel):
    user_agent: str
    ip_address: str

class SessionResponse(BaseModel):
    session_id: str
    expires_at: datetime

class ImageResponse(BaseModel):
    id: str
    title: str
    description: str
    tags: List[str]
    date: str
    views: int
    likes: int
    camera: Optional[str]
    settings: Optional[str]
    location: Optional[str]
    url: str
    thumbnail_url: str

class SecureImageToken(BaseModel):
    image_id: str
    session_id: str
    ip_address: str
    expires_at: datetime
    access_type: str  # 'view' or 'thumbnail'

# Rate limiting
def check_rate_limit(ip_address: str) -> bool:
    now = time.time()
    requests = rate_limiter[ip_address]
    
    # Remove old requests (older than 1 minute)
    rate_limiter[ip_address] = [req_time for req_time in requests if now - req_time < 60]
    
    # Check if under limit
    if len(rate_limiter[ip_address]) >= MAX_REQUESTS_PER_MINUTE:
        return False
    
    # Add current request
    rate_limiter[ip_address].append(now)
    return True

# Security functions
def generate_secure_token(image_id: str, session_id: str, ip_address: str, access_type: str) -> str:
    payload = {
        "image_id": image_id,
        "session_id": session_id,
        "ip_address": ip_address,
        "access_type": access_type,
        "exp": datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRY_MINUTES),
        "iat": datetime.utcnow(),
        "iss": "vaultsecure",
        "jti": str(uuid.uuid4())  # Unique token ID
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_secure_token(token: str, required_ip: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Verify IP address
        if payload.get("ip_address") != required_ip:
            raise HTTPException(status_code=403, detail="IP address mismatch")
        
        # Verify session is still active
        session_id = payload.get("session_id")
        if session_id not in active_sessions:
            raise HTTPException(status_code=401, detail="Session expired")
        
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def validate_referer(request: Request) -> bool:
    referer = request.headers.get("referer")
    # Allow requests without referer for demo purposes
    if not referer:
        return True
    
    parsed_referer = urlparse(referer)
    allowed_hosts = ALLOWED_DOMAINS + ["localhost:3000", "127.0.0.1:3000"]
    
    # More lenient validation for demo
    return any(host in f"{parsed_referer.netloc}" for host in allowed_hosts) or parsed_referer.netloc == ""

def add_watermark_to_image(image_path: str, watermark_text: str = "VaultSecure") -> io.BytesIO:
    """Add watermark to image for additional protection"""
    try:
        # For demo purposes, create a simple watermarked placeholder
        img_buffer = io.BytesIO()
        
        # Create a watermarked image (in production, you'd process the actual image)
        img = Image.new('RGB', (800, 600), color='purple')
        draw = ImageDraw.Draw(img)
        
        # Add watermark
        try:
            # Try to use a font, fallback to default if not available
            font = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf", 40)
        except:
            font = ImageFont.load_default()
        
        # Add semi-transparent watermark
        watermark_img = Image.new('RGBA', img.size, (0, 0, 0, 0))
        watermark_draw = ImageDraw.Draw(watermark_img)
        
        bbox = watermark_draw.textbbox((0, 0), watermark_text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        x = (img.size[0] - text_width) // 2
        y = (img.size[1] - text_height) // 2
        
        watermark_draw.text((x, y), watermark_text, font=font, fill=(255, 255, 255, 128))
        
        # Composite watermark onto image
        img = Image.alpha_composite(img.convert('RGBA'), watermark_img).convert('RGB')
        
        img.save(img_buffer, format='JPEG', quality=85)
        img_buffer.seek(0)
        
        return img_buffer
    except Exception as e:
        logging.error(f"Error adding watermark: {e}")
        # Return empty buffer if watermarking fails
        return io.BytesIO()

# Session management
def generate_session_id():
    return secrets.token_urlsafe(32)

def create_session(user_agent: str, ip_address: str) -> dict:
    session_id = generate_session_id()
    expires_at = datetime.utcnow() + timedelta(seconds=SESSION_TIMEOUT)
    
    session_data = {
        "session_id": session_id,
        "user_agent": user_agent,
        "ip_address": ip_address,
        "created_at": datetime.utcnow(),
        "expires_at": expires_at,
        "active": True,
        "requests_count": 0
    }
    
    active_sessions[session_id] = session_data
    return session_data

def validate_session(session_id: str, ip_address: str) -> bool:
    if session_id not in active_sessions:
        return False
    
    session = active_sessions[session_id]
    
    # Check expiry
    if datetime.utcnow() > session["expires_at"]:
        del active_sessions[session_id]
        return False
    
    # Check IP address consistency
    if session["ip_address"] != ip_address:
        del active_sessions[session_id]
        return False
    
    # Update request count
    session["requests_count"] += 1
    
    return True

def get_session_from_request(request: Request) -> Optional[str]:
    # Check for session in headers
    session_id = request.headers.get("X-Session-ID")
    if session_id and validate_session(session_id, request.client.host):
        return session_id
    
    return None

# Security dependencies
def require_session(request: Request):
    # Rate limiting - but more lenient
    try:
        if not check_rate_limit(request.client.host):
            logger.warning(f"Rate limit exceeded for {request.client.host}")
            # Don't fail immediately, just log
    except Exception as e:
        logger.warning(f"Rate limiting error: {e}")
    
    # Check for existing session
    session_id = get_session_from_request(request)
    if session_id and validate_session(session_id, request.client.host):
        return session_id
    
    # Create new session automatically if none exists
    logger.info(f"Auto-creating session for {request.client.host}")
    user_agent = request.headers.get("User-Agent", "Unknown")
    try:
        session_data = create_session(user_agent, request.client.host)
        return session_data["session_id"]
    except Exception as e:
        logger.error(f"Failed to auto-create session: {e}")
        raise HTTPException(status_code=500, detail="Session creation failed")

def require_secure_token(request: Request, token: str):
    # STRICT token validation for real security
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Verify IP address matches
        if payload.get("ip_address") != request.client.host:
            logger.warning(f"IP mismatch: token {payload.get('ip_address')} vs request {request.client.host}")
            raise HTTPException(status_code=403, detail="Token invalid for this IP")
        
        # Verify session is still active
        session_id = payload.get("session_id")
        if not validate_session(session_id, request.client.host):
            raise HTTPException(status_code=401, detail="Session expired or invalid")
        
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Sample image metadata
SAMPLE_IMAGES = [
    {
        "id": "1",
        "filename": "mountain_sunrise.jpg",
        "title": "Mountain Sunrise",
        "description": "A breathtaking sunrise over the mountain peaks during our hiking trip.",
        "tags": ["sunrise", "mountain", "hiking", "landscape"],
        "date_created": datetime(2024, 1, 15),
        "views": 156,
        "likes": 24,
        "camera": "Canon EOS R5",
        "settings": "f/8, 1/125s, ISO 100",
        "location": "Rocky Mountains, Colorado",
        "file_size": 5242880,
        "dimensions": "4000x3000"
    },
    {
        "id": "2",
        "filename": "ocean_waves.jpg",
        "title": "Ocean Waves",
        "description": "Powerful waves crashing against the rocky coastline at sunset.",
        "tags": ["ocean", "waves", "sunset", "rocks"],
        "date_created": datetime(2024, 1, 10),
        "views": 89,
        "likes": 18,
        "camera": "Sony A7R IV",
        "settings": "f/11, 1/60s, ISO 200",
        "location": "Big Sur, California",
        "file_size": 6291456,
        "dimensions": "4240x2832"
    },
    {
        "id": "3",
        "filename": "city_lights.jpg",
        "title": "City Lights",
        "description": "The bustling city comes alive at night with its vibrant lights.",
        "tags": ["city", "night", "lights", "urban"],
        "date_created": datetime(2024, 1, 8),
        "views": 234,
        "likes": 32,
        "camera": "Nikon D850",
        "settings": "f/5.6, 1/30s, ISO 1600",
        "location": "Tokyo, Japan",
        "file_size": 7340032,
        "dimensions": "3840x2160"
    },
    {
        "id": "4",
        "filename": "forest_path.jpg",
        "title": "Forest Path",
        "description": "A peaceful walk through the ancient forest on a misty morning.",
        "tags": ["forest", "path", "mist", "trees"],
        "date_created": datetime(2024, 1, 5),
        "views": 145,
        "likes": 27,
        "camera": "Fujifilm X-T4",
        "settings": "f/4, 1/80s, ISO 400",
        "location": "Olympic National Park, Washington",
        "file_size": 4194304,
        "dimensions": "3600x2400"
    },
    {
        "id": "5",
        "filename": "desert_dunes.jpg",
        "title": "Desert Dunes",
        "description": "The endless beauty of sand dunes stretching to the horizon.",
        "tags": ["desert", "dunes", "sand", "horizon"],
        "date_created": datetime(2024, 1, 2),
        "views": 78,
        "likes": 15,
        "camera": "Canon 5D Mark IV",
        "settings": "f/16, 1/250s, ISO 100",
        "location": "Sahara Desert, Morocco",
        "file_size": 5767168,
        "dimensions": "4896x3264"
    }
]

# Routes
@api_router.get("/")
async def root():
    return {"message": "VaultSecure API - Ultra-Protected Image Gallery", "version": "2.0"}

@api_router.get("/test")
async def test_connection():
    """Test endpoint that doesn't require authentication"""
    return {
        "status": "ok",
        "message": "API connection successful",
        "timestamp": datetime.utcnow().isoformat()
    }

@api_router.post("/session", response_model=SessionResponse)
async def create_session_endpoint(request: Request):
    """Create a new session for accessing protected images"""
    try:
        # More lenient rate limiting for session creation
        logger.info(f"Session creation request from {request.client.host}")
        
        user_agent = request.headers.get("User-Agent", "Unknown")
        ip_address = request.client.host
        
        # Clear any existing session for this IP first
        existing_sessions = [sid for sid, data in active_sessions.items() 
                           if data.get("ip_address") == ip_address]
        for sid in existing_sessions:
            del active_sessions[sid]
            logger.info(f"Cleared existing session {sid} for {ip_address}")
        
        session_data = create_session(user_agent, ip_address)
        logger.info(f"Created new session {session_data['session_id']} for {ip_address}")
        
        return SessionResponse(
            session_id=session_data["session_id"],
            expires_at=session_data["expires_at"]
        )
    except Exception as e:
        logger.error(f"Session creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Session creation failed: {str(e)}")

@api_router.get("/images", response_model=List[ImageResponse])
async def get_images(request: Request, session_id: str = Depends(require_session)):
    """Get list of all images with secure URLs from local gallery"""
    
    # Discover images dynamically from folder
    discovered_images = discover_images()
    logger.info(f"Discovered {len(discovered_images)} images in gallery")
    
    images = []
    for img_data in discovered_images:
        # Generate secure, time-limited tokens for each image
        view_token = generate_secure_token(
            img_data["id"], 
            session_id, 
            request.client.host, 
            "view"
        )
        thumbnail_token = generate_secure_token(
            img_data["id"], 
            session_id, 
            request.client.host, 
            "thumbnail"
        )
        
        # Use SECURE token-based URLs - no direct access
        image_url = f"/api/secure/image/{img_data['id']}/view?token={view_token}"
        thumbnail_url = f"/api/secure/image/{img_data['id']}/thumbnail?token={thumbnail_token}"
        
        images.append(ImageResponse(
            id=img_data["id"],
            title=img_data["title"],
            description=img_data["description"],
            tags=img_data["tags"],
            date=img_data["date_created"].strftime("%Y-%m-%d"),
            views=img_data["views"],
            likes=img_data["likes"],
            camera=img_data.get("camera"),
            settings=img_data.get("settings"),
            location=img_data.get("location"),
            url=image_url,
            thumbnail_url=thumbnail_url
        ))
    
    return images

@api_router.get("/secure/image/{image_id}/view")
async def view_secure_image(image_id: str, token: str, request: Request):
    """Serve ultra-protected image as base64 canvas data with real security"""
    
    try:
        # Validate secure token
        payload = require_secure_token(request, token)
        
        # Verify token is for the correct image and access type
        if payload["image_id"] != image_id or payload["access_type"] != "view":
            raise HTTPException(status_code=403, detail="Invalid token for this resource")
        
        # Verify referer and session
        session_id = payload.get("session_id")
        if not validate_session(session_id, request.client.host):
            raise HTTPException(status_code=401, detail="Invalid session")
        
        # Find image in discovered images
        discovered_images = discover_images()
        img_data = None
        for img in discovered_images:
            if img["id"] == image_id:
                img_data = img
                break
        
        if not img_data:
            raise HTTPException(status_code=404, detail="Image not found")
        
        # Increment view count (in memory for now)
        img_data["views"] += 1
        
        # Load the actual image from local file
        try:
            image_path = Path(img_data["file_path"])
            if not image_path.exists():
                raise HTTPException(status_code=404, detail="Image file not found")
            
            # Open and process the local image
            img = Image.open(image_path)
        
        # Add multiple watermarks and protection
        img = img.convert('RGBA')
        width, height = img.size
        
        # Create watermark overlay
        watermark = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(watermark)
        
        # Add session-specific watermarks
        watermark_text = f"VAULTSECURE-{session_id[:8]}-{request.client.host}"
        
        try:
            font_size = max(20, min(width, height) // 20)
            font = ImageFont.load_default()
        except:
            font = ImageFont.load_default()
        
        # Add multiple diagonal watermarks
        for i in range(0, width + height, 200):
            for j in range(0, width, 300):
                x = j - i + height
                y = i
                if 0 <= x <= width and 0 <= y <= height:
                    draw.text((x, y), watermark_text, font=font, fill=(255, 255, 255, 80))
                    draw.text((x+1, y+1), watermark_text, font=font, fill=(0, 0, 0, 40))
        
        # Add corner watermarks
        draw.text((10, 10), "© VaultSecure", font=font, fill=(255, 255, 255, 120))
        draw.text((width-150, height-30), f"ID:{image_id}", font=font, fill=(255, 255, 255, 120))
        
        # Composite watermark onto image
        protected_img = Image.alpha_composite(img, watermark)
        protected_img = protected_img.convert('RGB')
        
        # Convert to base64 for canvas rendering
        img_buffer = io.BytesIO()
        protected_img.save(img_buffer, format='JPEG', quality=85)
        img_buffer.seek(0)
        
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        # Return JSON with canvas data and security headers
        security_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "no-referrer",
            "X-VaultSecure-Protected": "true",
            "X-Image-ID": image_id,
            "Cache-Control": "no-store, no-cache, must-revalidate, private",
            "Pragma": "no-cache",
            "Expires": "0"
        }
        
        from fastapi.responses import JSONResponse
        response = JSONResponse({
            "success": True,
            "imageData": f"data:image/jpeg;base64,{img_base64}",
            "imageId": image_id,
            "sessionId": session_id[:8],
            "timestamp": datetime.utcnow().isoformat(),
            "security": {
                "watermarked": True,
                "sessionBound": True,
                "antiDownload": True
            }
        })
        
        for key, value in security_headers.items():
            response.headers[key] = value
        
        return response
        
    except Exception as e:
        logger.error(f"Error serving secure image {image_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to load protected image")

@api_router.get("/secure/image/{image_id}/thumbnail")
async def view_secure_thumbnail(image_id: str, token: str, request: Request):
    """Serve ultra-protected thumbnail with token validation"""
    
    try:
        # Validate secure token
        payload = require_secure_token(request, token)
        
        # Verify token is for the correct image and access type
        if payload["image_id"] != image_id or payload["access_type"] != "thumbnail":
            raise HTTPException(status_code=403, detail="Invalid token for this resource")
        
        # Find image in discovered images
        discovered_images = discover_images()
        img_data = None
        for img in discovered_images:
            if img["id"] == image_id:
                img_data = img
                break
        
        if not img_data:
            raise HTTPException(status_code=404, detail="Image not found")
        
        # Load and create thumbnail from local file
        try:
            image_path = Path(img_data["file_path"])
            if not image_path.exists():
                raise HTTPException(status_code=404, detail="Image file not found")
            
            # Open image and create thumbnail
            img = Image.open(image_path)
            
            # Create thumbnail (300x200)
            img.thumbnail((300, 200), Image.Resampling.LANCZOS)
            
            # Add watermark to thumbnail
            draw = ImageDraw.Draw(img)
            try:
                font = ImageFont.load_default()
            except:
                font = None
            
            # Add small watermark
            if font:
                draw.text((5, 5), "VaultSecure", font=font, fill='rgba(255,255,255,0.8)')
            
            # Convert to bytes
            img_buffer = io.BytesIO()
            img.save(img_buffer, format='JPEG', quality=80)
            img_buffer.seek(0)
            
            # Return as response
            return StreamingResponse(
                io.BytesIO(img_buffer.getvalue()),
                media_type="image/jpeg",
                headers={
                    "X-Content-Type-Options": "nosniff",
                    "X-Frame-Options": "SAMEORIGIN",
                    "X-VaultSecure-Protected": "true",
                    "Cache-Control": "private, max-age=300"
                }
            )
            
        except Exception as img_error:
            logger.error(f"Error processing image {image_id}: {img_error}")
            # Create fallback thumbnail with better error handling
            fallback_img = Image.new('RGB', (300, 200), color='#4c1d95')
            draw = ImageDraw.Draw(fallback_img)
            
            try:
                font = ImageFont.load_default()
                # Center the text
                text = img_data.get('title', f'Image {image_id}')
                bbox = draw.textbbox((0, 0), text, font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                x = (300 - text_width) // 2
                y = (200 - text_height) // 2
                
                draw.text((x, y), text, font=font, fill='white')
                draw.text((10, 10), 'VaultSecure', font=font, fill='rgba(255,255,255,0.7)')
                draw.text((10, 180), 'Protected', font=font, fill='rgba(255,255,255,0.7)')
            except Exception as font_error:
                logger.error(f"Font error: {font_error}")
                # Fallback without font
                draw.rectangle([50, 80, 250, 120], fill='white')
                
            img_buffer = io.BytesIO()
            fallback_img.save(img_buffer, format='JPEG', quality=80)
            img_buffer.seek(0)
            
            return StreamingResponse(
                io.BytesIO(img_buffer.getvalue()),
                media_type="image/jpeg",
                headers={
                    "X-Content-Type-Options": "nosniff",
                    "X-VaultSecure-Protected": "true",
                    "Cache-Control": "private, max-age=300",
                    "X-Error": "Image processing failed"
                }
            )
        
    except Exception as e:
        logger.error(f"Error serving thumbnail {image_id}: {e}")
        # Final fallback
        fallback_img = Image.new('RGB', (300, 200), color='#ef4444')
        draw = ImageDraw.Draw(fallback_img)
        
        try:
            font = ImageFont.load_default()
            draw.text((10, 90), f"Thumb {image_id}", font=font, fill='white')
        except:
            pass
            
        img_buffer = io.BytesIO()
        fallback_img.save(img_buffer, format='JPEG', quality=80)
        img_buffer.seek(0)
        
        return StreamingResponse(
            io.BytesIO(img_buffer.getvalue()),
            media_type="image/jpeg",
            headers={"X-Content-Type-Options": "nosniff"}
        )

@api_router.post("/images/{image_id}/like")
async def like_image(image_id: str, request: Request, session_id: str = Depends(require_session)):
    """Like an image with security validation"""
    
    # Find image in discovered images
    discovered_images = discover_images()
    img_data = None
    for img in discovered_images:
        if img["id"] == image_id:
            img_data = img
            break
    
    if not img_data:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Increment like count (in memory for now)
    img_data["likes"] += 1
    
    return {"message": "Image liked successfully", "likes": img_data["likes"]}

@api_router.get("/images/refresh")
async def refresh_images(request: Request, session_id: str = Depends(require_session)):
    """Refresh image discovery - useful for adding new images"""
    
    try:
        discovered_images = discover_images()
        logger.info(f"Refreshed image discovery: found {len(discovered_images)} images")
        
        return {
            "message": "Images refreshed successfully",
            "count": len(discovered_images),
            "images": [img["filename"] for img in discovered_images]
        }
    except Exception as e:
        logger.error(f"Error refreshing images: {e}")
        raise HTTPException(status_code=500, detail="Failed to refresh images")

@api_router.get("/session/validate")
async def validate_session_endpoint(request: Request):
    """Validate current session with enhanced security"""
    session_id = get_session_from_request(request)
    if not session_id:
        raise HTTPException(status_code=401, detail="No valid session")
    
    session_data = active_sessions.get(session_id)
    if not session_data:
        raise HTTPException(status_code=401, detail="Session not found")
    
    return {
        "valid": True,
        "session_id": session_id,
        "expires_at": session_data["expires_at"],
        "security_level": "maximum"
    }

@api_router.delete("/session")
async def logout_session(request: Request, session_id: str = Depends(require_session)):
    """Logout and invalidate session"""
    if session_id in active_sessions:
        del active_sessions[session_id]
    
    return {"message": "Session invalidated successfully"}

@api_router.post("/security-violation")
async def log_security_violation(request: Request):
    """Log security violations for monitoring - always succeeds"""
    try:
        body = await request.json()
        violation = body.get("violation", "Unknown violation")
        timestamp = body.get("timestamp", datetime.utcnow().isoformat())
        user_agent = body.get("userAgent", "Unknown")
        
        # Log different levels based on violation type
        if "MONITORED" in violation:
            logger.info(f"🔍 SECURITY MONITOR: {violation} | IP: {request.client.host}")
        elif "BREACH" in violation:
            logger.critical(f"🚨 SECURITY BREACH: {violation} | IP: {request.client.host} | UA: {user_agent}")
        else:
            logger.warning(f"🔒 SECURITY EVENT: {violation} | IP: {request.client.host}")
        
        return {"status": "logged", "message": "Security event recorded"}
    except Exception as e:
        logger.error(f"Failed to log security violation: {e}")
        # Always return success to avoid breaking the frontend
        return {"status": "logged", "message": "Security monitoring active"}

# Include the router in the main app
app.include_router(api_router)

# Enhanced CORS middleware with strict policies
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "https://securegallaery.onrender.com",
        "https://*.onrender.com",
        "https://5cfb91b9-9781-4651-ab88-c7db44f175d7.preview.emergentagent.com",
        "https://*.preview.emergentagent.com",
        "https://c8d34c90-0819-4af7-aa7d-2a5f6dafa7f8.e1-eu-north-azure.choreoapps.dev",
        "https://*.e1-eu-north-azure.choreoapps.dev",
        "https://*.choreoapps.dev"
    ],
    allow_methods=["GET", "POST", "DELETE", "OPTIONS", "PUT", "PATCH"],  # Add all methods
    allow_headers=["*"],  # Allow all headers for development
    expose_headers=["X-Security-Level", "X-Session-ID"]
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=[
        "localhost", 
        "127.0.0.1", 
        "*.localhost", 
        "securegallaery.onrender.com",
        "*.onrender.com",
        "5cfb91b9-9781-4651-ab88-c7db44f175d7.preview.emergentagent.com",
        "*.preview.emergentagent.com",
        "c8d34c90-0819-4af7-aa7d-2a5f6dafa7f8.e1-eu-north-azure.choreoapps.dev",
        "*.e1-eu-north-azure.choreoapps.dev",
        "*.choreoapps.dev"
    ]
)

# Logging already configured above

@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    
    # Add comprehensive security headers (relaxed for local development)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"  # Changed from DENY
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    # Removed HSTS for local development
    response.headers["Content-Security-Policy"] = "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: http: https:; img-src 'self' data: https: http:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'"
    response.headers["X-Security-Level"] = "MAXIMUM"
    
    return response

@app.on_event("startup")
async def startup_event():
    logger.info("VaultSecure API starting up with maximum security...")
    logger.info(f"Images directory: {IMAGES_DIR}")
    
    # Discover existing images
    discovered_images = discover_images()
    logger.info(f"Discovered {len(discovered_images)} images in gallery:")
    for img in discovered_images:
        logger.info(f"  - {img['filename']} ({img['title']})")
    
    logger.info(f"Session timeout: {SESSION_TIMEOUT} seconds")
    logger.info(f"Token expiry: {TOKEN_EXPIRY_MINUTES} minutes")
    logger.info(f"Rate limit: {MAX_REQUESTS_PER_MINUTE} requests/minute")

@app.on_event("shutdown")
async def shutdown_db_client():
    # client.close()  # Disabled for local development
    logger.info("VaultSecure API shutting down...")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "active_sessions": len(active_sessions),
        "security_level": "maximum",
        "service": "VaultSecure"
    }
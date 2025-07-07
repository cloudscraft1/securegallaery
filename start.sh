#!/bin/sh

# Startup script for VaultSecure Gallery Docker container
set -e

echo "🚀 Starting VaultSecure Gallery Container..."

# Function to handle graceful shutdown
cleanup() {
    echo "🔄 Shutting down services gracefully..."
    supervisorctl stop all
    nginx -s quit
    exit 0
}

# Trap signals for graceful shutdown
trap cleanup SIGTERM SIGINT

# Create log directories if they don't exist
mkdir -p /var/log/nginx
mkdir -p /var/log/supervisor
mkdir -p /run/nginx

# Set proper permissions
chown -R nginx:www-data /var/log/nginx
chown -R nginx:www-data /run/nginx
chmod 755 /var/log/supervisor

# Test nginx configuration
echo "🔧 Testing nginx configuration..."
nginx -t

# Check if frontend build exists
if [ ! -d "/app/frontend/build" ] || [ -z "$(ls -A /app/frontend/build)" ]; then
    echo "❌ Frontend build directory is missing or empty!"
    echo "📁 Contents of /app/frontend:"
    ls -la /app/frontend/ || echo "Frontend directory not found"
    exit 1
fi

# Check if backend files exist
if [ ! -f "/app/backend/server.py" ]; then
    echo "❌ Backend server.py not found!"
    echo "📁 Contents of /app/backend:"
    ls -la /app/backend/ || echo "Backend directory not found"
    exit 1
fi

# Create environment file for backend if it doesn't exist
if [ ! -f "/app/backend/.env" ]; then
    echo "📝 Creating default backend environment file..."
    cat > /app/backend/.env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=secure_gallery
EOF
fi

# Test Python imports
echo "🐍 Testing Python backend dependencies..."
cd /app/backend
python -c "
try:
    import fastapi, uvicorn, motor, pydantic, jwt, PIL
    print('✅ All Python dependencies available')
except ImportError as e:
    print(f'❌ Missing Python dependency: {e}')
    exit(1)
" || exit 1

# Show system information
echo "ℹ️  System Information:"
echo "   - OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "   - Python: $(python --version)"
echo "   - Nginx: $(nginx -v 2>&1)"
echo "   - FastAPI Backend: /app/backend"
echo "   - React Frontend: /app/frontend/build"

# Start MongoDB if needed (for development)
if command -v mongod >/dev/null 2>&1; then
    echo "🍃 Starting MongoDB..."
    mongod --fork --logpath /var/log/mongodb.log --dbpath /data/db
fi

# Show listening ports before starting
echo "📡 Network configuration:"
netstat -tlnp 2>/dev/null || echo "   netstat not available"

# Start supervisord
echo "🎯 Starting services with supervisor..."
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf

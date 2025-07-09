#!/bin/sh

# VaultSecure Gallery - Production Docker Entrypoint
set -e

echo "🚀 Starting VaultSecure Gallery..."
echo "Environment: NODE_ENV=${NODE_ENV:-production}"
echo "Port: ${PORT:-8080}"
echo "User: $(id -u):$(id -g)"
echo "Working directory: $(pwd)"

# Create necessary directories with better error handling
echo "📁 Creating necessary directories..."
mkdir -p /app/backend/images/gallery || { echo "Failed to create /app/backend/images/gallery"; exit 1; }
mkdir -p /var/log/nginx || { echo "Failed to create /var/log/nginx"; exit 1; }
mkdir -p /var/log/supervisor || { echo "Failed to create /var/log/supervisor"; exit 1; }
mkdir -p /var/run/nginx || { echo "Failed to create /var/run/nginx"; exit 1; }
mkdir -p /tmp/client_temp || { echo "Failed to create /tmp/client_temp"; exit 1; }
mkdir -p /tmp/proxy_temp || { echo "Failed to create /tmp/proxy_temp"; exit 1; }
mkdir -p /tmp/fastcgi_temp || { echo "Failed to create /tmp/fastcgi_temp"; exit 1; }
mkdir -p /tmp/uwsgi_temp || { echo "Failed to create /tmp/uwsgi_temp"; exit 1; }
mkdir -p /tmp/scgi_temp || { echo "Failed to create /tmp/scgi_temp"; exit 1; }

# Set proper permissions for non-root user
if [ "$(id -u)" != "0" ]; then
    echo "Running as non-root user (UID: $(id -u))"
    # Ensure directories are accessible
    chmod 755 /app/backend/images/gallery 2>/dev/null || echo "Warning: Could not set permissions on /app/backend/images/gallery"
    chmod 755 /var/log/nginx 2>/dev/null || echo "Warning: Could not set permissions on /var/log/nginx"
    chmod 755 /var/log/supervisor 2>/dev/null || echo "Warning: Could not set permissions on /var/log/supervisor"
    chmod 755 /var/run/nginx 2>/dev/null || echo "Warning: Could not set permissions on /var/run/nginx"
else
    echo "Running as root user"
fi

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
nginx -t || { echo "Nginx configuration test failed"; exit 1; }

# Check if Python and required packages are available
echo "🐍 Checking Python environment..."
cd /app/backend
python -c "import fastapi, uvicorn; print('Python environment OK')" || { echo "Python environment check failed"; exit 1; }

# Start supervisor which manages both nginx and the FastAPI backend
echo "🛡️ Starting VaultSecure services..."
echo "Supervisor config: /etc/supervisor/conf.d/supervisord.conf"
echo "Starting supervisor in foreground mode..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf -n

#!/bin/sh

# VaultSecure Gallery - Production Docker Entrypoint
set -e

echo "🚀 Starting VaultSecure Gallery..."

# Create necessary directories
mkdir -p /app/backend/images/gallery
mkdir -p /app/logs
mkdir -p /var/log/nginx
mkdir -p /var/log/supervisor
mkdir -p /run/nginx

# Set proper permissions for non-root user
if [ "$(id -u)" != "0" ]; then
    echo "Running as non-root user (UID: $(id -u))"
    # Ensure directories are accessible
    chmod 755 /app/backend/images/gallery 2>/dev/null || true
    chmod 755 /app/logs 2>/dev/null || true
    chmod 755 /var/log/nginx 2>/dev/null || true
    chmod 755 /var/log/supervisor 2>/dev/null || true
    chmod 755 /run/nginx 2>/dev/null || true
else
    echo "Running as root user"
fi

# Start supervisor which manages both nginx and the FastAPI backend
echo "🛡️ Starting VaultSecure services..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf -n

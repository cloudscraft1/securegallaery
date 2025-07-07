#!/bin/sh

# VaultSecure Gallery - Production Docker Entrypoint
set -e

echo "🚀 Starting VaultSecure Gallery..."

# Create necessary directories
mkdir -p /app/backend/images/gallery
mkdir -p /var/log/nginx
mkdir -p /var/log/supervisor
mkdir -p /run/nginx

# Set proper permissions for nginx (if running as non-root)
if [ "$USER" = "appuser" ]; then
    # Running as non-root user, ensure directories are accessible
    chmod 755 /app/backend/images/gallery
    chmod 755 /var/log/nginx
    chmod 755 /var/log/supervisor
    chmod 755 /run/nginx
fi

# Start supervisor which manages both nginx and the FastAPI backend
echo "🛡️ Starting VaultSecure services..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf -n

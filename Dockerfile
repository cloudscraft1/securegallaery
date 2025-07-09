# Multi-stage production Dockerfile for VaultSecure Gallery
FROM node:22-alpine AS frontend-builder

# Build frontend
WORKDIR /app/frontend

# Production environment variables
ENV NODE_ENV=production
ENV REACT_APP_BACKEND_URL=""
ENV GENERATE_SOURCEMAP=false
ENV DISABLE_ESLINT_PLUGIN=true
ENV SKIP_PREFLIGHT_CHECK=true
ENV CI=true
ENV INLINE_RUNTIME_CHUNK=false

# Copy package files first for better caching
COPY frontend/package*.json ./

# Install dependencies with timeout and retry
RUN npm install --legacy-peer-deps --production=false --timeout=300000 --maxsockets=1

# Copy all frontend files
COPY frontend/ .

# Build the React app for production
RUN npm run build

# Verify build was successful
RUN ls -la /app/frontend/build

# Python backend stage  
FROM python:3.13-slim AS backend-builder

# Install minimal system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --upgrade pip

WORKDIR /app/backend
COPY backend/requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# Final stage - combine frontend and backend
FROM python:3.13-slim AS production

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    curl \
    libjpeg62-turbo \
    zlib1g \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy backend files and Python packages
COPY --from=backend-builder /app/backend ./backend
COPY --from=backend-builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# Copy built frontend files
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Create necessary directories
RUN mkdir -p /app/backend/images/gallery
RUN mkdir -p /var/log/supervisor
RUN mkdir -p /var/run/nginx
RUN mkdir -p /var/log/nginx
RUN mkdir -p /var/lib/nginx
RUN mkdir -p /var/cache/nginx

# Copy configuration files
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create entrypoint script with Unix line endings
RUN printf '#!/bin/sh\n\n# VaultSecure Gallery - Production Docker Entrypoint\nset -e\n\necho "🚀 Starting VaultSecure Gallery..."\n\n# Create necessary directories\nmkdir -p /app/backend/images/gallery\nmkdir -p /var/log/nginx\nmkdir -p /var/log/supervisor\nmkdir -p /var/run/nginx\nmkdir -p /tmp/client_temp\nmkdir -p /tmp/proxy_temp\nmkdir -p /tmp/fastcgi_temp\nmkdir -p /tmp/uwsgi_temp\nmkdir -p /tmp/scgi_temp\n\n# Set proper permissions for non-root user\nif [ "$(id -u)" != "0" ]; then\n    echo "Running as non-root user (UID: $(id -u))"\n    # Ensure directories are accessible\n    chmod 755 /app/backend/images/gallery 2>/dev/null || true\n    chmod 755 /var/log/nginx 2>/dev/null || true\n    chmod 755 /var/log/supervisor 2>/dev/null || true\n    chmod 755 /var/run/nginx 2>/dev/null || true\nelse\n    echo "Running as root user"\nfi\n\n# Start supervisor which manages both nginx and the FastAPI backend\necho "🛡️ Starting VaultSecure services..."\nexec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf -n\n' > /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create choreo.dev compatible non-root user with UID 10001
RUN useradd -u 10001 -m -s /bin/bash appuser

# Set permissions for non-root user
RUN chown -R appuser:appuser /app /var/log/nginx /var/lib/nginx /var/run/nginx /var/cache/nginx /var/log/supervisor

# Expose port 8080 for nginx (main entry point)
EXPOSE 8080

# Health check on non-privileged port
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Set environment variables for proper port configuration
ENV PORT=8080
ENV NGINX_PORT=8080
ENV BACKEND_PORT=8000

# Switch to non-root user
USER 10001

# Start services
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

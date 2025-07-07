# Multi-stage production Dockerfile for VaultSecure Gallery
FROM node:22-alpine AS frontend-builder

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps --production=false

COPY frontend/ .
# Production environment variables
ENV NODE_ENV=production
ENV REACT_APP_BACKEND_URL=""
ENV GENERATE_SOURCEMAP=false

# Build the React app for production
RUN npm run build

# Python backend stage
FROM python:3.13-alpine AS backend-builder

# Install build dependencies
RUN apk add --no-cache \
    gcc \
    musl-dev \
    linux-headers \
    postgresql-dev \
    jpeg-dev \
    zlib-dev \
    freetype-dev \
    lcms2-dev \
    openjpeg-dev \
    tiff-dev \
    tk-dev \
    tcl-dev

WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# Final stage - combine frontend and backend
FROM python:3.13-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    jpeg \
    zlib \
    freetype \
    lcms2 \
    openjpeg \
    tiff \
    tk \
    tcl

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
RUN mkdir -p /run/nginx

# Copy configuration files
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create choreo.dev compatible non-root user with UID 10001
RUN adduser -D -u 10001 -s /bin/sh appuser

# Create necessary directories and set permissions for non-root user
RUN mkdir -p /app/backend/images/gallery /app/logs /var/log/nginx /var/lib/nginx /run/nginx /var/cache/nginx /var/log/supervisor
RUN chown -R appuser:appuser /app /var/log/nginx /var/lib/nginx /run/nginx /var/cache/nginx /var/log/supervisor

# Expose non-privileged port for choreo.dev
EXPOSE 8080

# Health check on non-privileged port
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Switch to non-root user
USER 10001

# Start services
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

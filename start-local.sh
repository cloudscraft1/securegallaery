#!/bin/bash

# Simple startup script for local testing
set -e

echo "🚀 Starting VaultSecure Gallery locally..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build the Docker image
echo "🏗️ Building Docker image..."
docker build -t vaultsecure-gallery:latest .

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker stop vaultsecure-gallery 2>/dev/null || true
docker rm vaultsecure-gallery 2>/dev/null || true

# Run the container
echo "🔄 Starting container..."
docker run -d \
    --name vaultsecure-gallery \
    -p 8080:8080 \
    -e NODE_ENV=production \
    -e PYTHONPATH=/app \
    -e PYTHONUNBUFFERED=1 \
    -e PORT=8080 \
    vaultsecure-gallery:latest

echo "✅ Container started successfully!"
echo "📍 Application should be available at: http://localhost:8080"
echo "🏥 Health check: http://localhost:8080/health"
echo "📋 View logs: docker logs -f vaultsecure-gallery"
echo "🛑 Stop container: docker stop vaultsecure-gallery"

# Wait a moment and check if container is running
sleep 5
if docker ps | grep -q vaultsecure-gallery; then
    echo "✅ Container is running!"
    echo "🔍 Testing health endpoint..."
    
    # Wait for service to be ready
    sleep 10
    
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        echo "✅ Health check passed!"
    else
        echo "❌ Health check failed. Check logs:"
        docker logs vaultsecure-gallery
    fi
else
    echo "❌ Container failed to start. Check logs:"
    docker logs vaultsecure-gallery
fi

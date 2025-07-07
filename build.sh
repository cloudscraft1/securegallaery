#!/bin/bash

# Build script for VaultSecure Gallery Docker container
set -e

echo "🏗️  Building VaultSecure Gallery Docker Container..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose >/dev/null 2>&1; then
    print_warning "docker-compose not found. Trying docker compose..."
    if ! docker compose version >/dev/null 2>&1; then
        print_error "Neither docker-compose nor 'docker compose' is available."
        exit 1
    fi
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

print_status "Using: $DOCKER_COMPOSE"

# Clean up previous builds (optional)
if [ "$1" = "--clean" ]; then
    print_status "Cleaning up previous builds..."
    docker system prune -f
    docker volume prune -f
    print_success "Cleanup completed"
fi

# Build the Docker image
print_status "Building Docker image..."
docker build \
    --tag secure-gallery:latest \
    --tag secure-gallery:$(date +%Y%m%d-%H%M%S) \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    --no-cache \
    .

print_success "Docker image built successfully!"

# Show image information
print_status "Image information:"
docker images secure-gallery:latest

# Optional: Run security scan
if command -v docker scan >/dev/null 2>&1; then
    print_status "Running security scan..."
    docker scan secure-gallery:latest || print_warning "Security scan failed or found vulnerabilities"
fi

# Optional: Test the build
if [ "$1" = "--test" ] || [ "$2" = "--test" ]; then
    print_status "Testing the build..."
    
    # Start services
    $DOCKER_COMPOSE up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to start..."
    sleep 30
    
    # Test health endpoint
    if curl -f http://localhost/health >/dev/null 2>&1; then
        print_success "Health check passed!"
    else
        print_error "Health check failed!"
        $DOCKER_COMPOSE logs
        $DOCKER_COMPOSE down
        exit 1
    fi
    
    # Cleanup test
    print_status "Stopping test containers..."
    $DOCKER_COMPOSE down
fi

print_success "Build completed successfully!"
print_status "To run the application:"
echo "  $DOCKER_COMPOSE up -d"
print_status "To view logs:"
echo "  $DOCKER_COMPOSE logs -f"
print_status "To stop the application:"
echo "  $DOCKER_COMPOSE down"

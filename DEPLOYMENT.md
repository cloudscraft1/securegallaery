# Production Deployment Guide 🚀

## Quick Production Deployment

### 1. Build and Deploy with Docker

```bash
# Clone the repository
git clone <your-repo-url>
cd vaultsecure-gallery

# Build the production image
docker build -t vaultsecure-gallery:latest .

# Run with production compose
docker-compose -f docker-compose.production.yml up -d

# Verify deployment
curl http://localhost/health
```

### 2. Access Your Application

- **Frontend**: http://your-domain/
- **API Documentation**: http://your-domain/api/docs
- **Health Check**: http://your-domain/health

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file:

```bash
NODE_ENV=production
PYTHONPATH=/app
PYTHONUNBUFFERED=1
GENERATE_SOURCEMAP=false
```

### Docker Compose Override

For custom configurations, create `docker-compose.override.yml`:

```yaml
version: '3.8'
services:
  vaultsecure:
    ports:
      - "8080:80"  # Custom port
    environment:
      - CUSTOM_SETTING=value
```

## Domain and HTTPS Setup

### 1. Domain Configuration

Update your DNS to point to your server:
```
A record: your-domain.com → YOUR_SERVER_IP
```

### 2. HTTPS with Let's Encrypt (Recommended)

Add Traefik reverse proxy for automatic HTTPS:

```yaml
# docker-compose.https.yml
version: '3.8'
services:
  traefik:
    image: traefik:v3.0
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/etc/traefik/traefik.yml:ro
      - ./acme:/acme
    labels:
      - "traefik.enable=true"
      
  vaultsecure:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.vaultsecure.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.vaultsecure.tls.certresolver=letsencrypt"
```

### 3. Nginx SSL Termination

Alternative: Use nginx for SSL termination:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Performance Optimization

### 1. Resource Allocation

Adjust Docker resource limits:

```yaml
services:
  vaultsecure:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
```

### 2. Caching Strategy

Enable Redis for session caching:

```yaml
services:
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

### 3. CDN Integration

For static assets, configure CDN:

```bash
# Environment variable
REACT_APP_CDN_URL=https://cdn.your-domain.com
```

## Monitoring and Logging

### 1. Health Monitoring

Set up monitoring with healthchecks:

```bash
# Check application health
curl -f http://localhost/health || exit 1

# Monitor with external service
curl -fsS -m 10 --retry 5 -o /dev/null https://hc-ping.com/YOUR_UUID_HERE
```

### 2. Log Management

Configure log rotation:

```bash
# Create logrotate config
cat > /etc/logrotate.d/vaultsecure << EOF
/var/log/vaultsecure/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF
```

### 3. Metrics Collection

Add Prometheus metrics:

```yaml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
```

## Security Hardening

### 1. Firewall Configuration

```bash
# Allow only necessary ports
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable
```

### 2. Container Security

Run with security options:

```yaml
services:
  vaultsecure:
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETGID
      - SETUID
```

### 3. Regular Updates

```bash
# Update system packages
apt update && apt upgrade -y

# Update Docker images
docker-compose pull
docker-compose up -d

# Clean up old images
docker image prune -f
```

## Backup Strategy

### 1. Volume Backup

```bash
# Backup persistent data
docker run --rm -v vaultsecure_gallery_images:/data -v $(pwd):/backup alpine tar czf /backup/gallery-backup-$(date +%Y%m%d).tar.gz /data
```

### 2. Automated Backups

```bash
#!/bin/bash
# backup-script.sh
DATE=$(date +%Y%m%d_%H%M%S)
docker run --rm \
  -v vaultsecure_gallery_images:/data \
  -v /backup:/backup \
  alpine tar czf /backup/gallery-$DATE.tar.gz /data

# Keep only last 7 days
find /backup -name "gallery-*.tar.gz" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /path/to/backup-script.sh
```

## Troubleshooting

### Common Issues

1. **Port conflicts**:
   ```bash
   # Check what's using port 80
   netstat -tlnp | grep :80
   ```

2. **Memory issues**:
   ```bash
   # Monitor container memory
   docker stats vaultsecure-gallery
   ```

3. **Permission errors**:
   ```bash
   # Fix volume permissions
   docker exec vaultsecure-gallery chown -R appuser:appgroup /app
   ```

### Log Analysis

```bash
# View application logs
docker-compose logs -f vaultsecure

# Check nginx access logs
docker exec vaultsecure-gallery tail -f /var/log/nginx/access.log

# Check error logs
docker exec vaultsecure-gallery tail -f /var/log/nginx/error.log
```

## Scaling

### Horizontal Scaling

```yaml
services:
  vaultsecure:
    deploy:
      replicas: 3
  
  nginx-lb:
    image: nginx:alpine
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
    depends_on:
      - vaultsecure
```

### Load Balancer Configuration

```nginx
upstream vaultsecure_backend {
    server vaultsecure_1:80;
    server vaultsecure_2:80;
    server vaultsecure_3:80;
}

server {
    listen 80;
    location / {
        proxy_pass http://vaultsecure_backend;
    }
}
```

---

**Need help?** Check the main [README.md](README.md) or create an issue in the repository.

# 🚀 Deployment Guide

## Local Development

### First Time Setup

```bash
# 1. Clone/navigate to project
cd social-app

# 2. Start Docker services
docker-compose up -d

# 3. Wait for services to be ready (1-2 minutes)
# Check status: docker-compose ps

# 4. Backend setup
cd backend
npm install
npx prisma migrate dev --name init
cd ..

# 5. Frontend setup
cd frontend
npm install
cd ..
```

### Daily Development

```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3 (optional): Database UI
cd backend
npx prisma studio
```

---

## Production Deployment

### Prerequisites
- Docker & Docker Compose installed
- Server with at least 2GB RAM
- Domain name configured
- SSL certificate (optional but recommended)

### Build & Deploy with Docker

```bash
# 1. Clone project to server
git clone <repo-url> social-app
cd social-app

# 2. Create production .env file
cp .env .env.production
# Edit .env.production with production values
nano .env.production

# 3. Build Docker images
docker-compose -f docker-compose.prod.yml build

# 4. Start services
docker-compose -f docker-compose.prod.yml up -d

# 5. Verify services are running
docker-compose -f docker-compose.prod.yml ps
```

### Environment Variables for Production

Create `.env.production`:

```env
# Database
DB_USER=social_admin
DB_PASSWORD=<strong-password>
DB_NAME=social_db

# JWT (Generate new secrets!)
JWT_ACCESS_SECRET=<random-secret-32-chars>
JWT_REFRESH_SECRET=<random-secret-32-chars>

# MinIO
MINIO_USER=minio_admin
MINIO_PASSWORD=<strong-password>

# Frontend URLs
FRONTEND_API_URL=https://yourdomain.com/api
FRONTEND_SOCKET_URL=https://yourdomain.com

# Node
NODE_ENV=production
```

### Generate Strong Secrets

```bash
# Generate random secrets
openssl rand -base64 32
openssl rand -base64 32
```

---

## Nginx Reverse Proxy Setup

Create `nginx.conf`:

```nginx
upstream backend {
    server backend:3001;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # API routes
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Database Backup & Recovery

### Backup PostgreSQL

```bash
# Backup database
docker exec social_postgres pg_dump -U admin social_db > backup.sql

# Backup with compression
docker exec social_postgres pg_dump -U admin -Fc social_db > backup.dump
```

### Restore PostgreSQL

```bash
# From SQL backup
docker exec -i social_postgres psql -U admin social_db < backup.sql

# From compressed backup
docker exec -i social_postgres pg_restore -U admin -d social_db backup.dump
```

---

## Monitoring & Logs

### View Container Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Check Disk Usage

```bash
docker system df
```

### Cleanup

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Full cleanup
docker system prune -a --volumes
```

---

## Performance Optimization

### Database
- Add indexes on frequently queried fields
- Use connection pooling (PgBouncer)
- Regular vacuum maintenance

### Backend
- Enable caching with Redis
- Implement rate limiting
- Use compression (gzip)
- Monitor memory usage

### Frontend
- Enable CDN for static assets
- Implement service worker for PWA
- Code splitting and lazy loading
- Image optimization

---

## CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker images
        run: docker-compose build

      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker tag social-app-backend:latest ${{ secrets.DOCKER_USERNAME }}/social-app-backend:latest
          docker push ${{ secrets.DOCKER_USERNAME }}/social-app-backend:latest

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /home/user/social-app
            docker-compose pull
            docker-compose up -d
```

---

## Troubleshooting Deployment

### Services won't start
```bash
# Check logs
docker-compose logs

# Restart services
docker-compose restart

# Rebuild images
docker-compose up -d --build
```

### Database connection fails
```bash
# Check PostgreSQL
docker-compose logs postgres

# Reset database (careful!)
docker-compose down -v
docker-compose up -d
cd backend && npx prisma migrate dev
```

### High memory usage
```bash
# Check container stats
docker stats

# Limit resources in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
```

---

## Security Checklist

- [ ] Change default passwords
- [ ] Generate new JWT secrets
- [ ] Enable SSL/TLS
- [ ] Configure firewall rules
- [ ] Setup regular backups
- [ ] Enable database password authentication
- [ ] Rotate secrets periodically
- [ ] Monitor error logs for attacks
- [ ] Implement rate limiting
- [ ] Setup DDoS protection

---

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Multiple backend instances
- Shared database (PostgreSQL replicas)
- Shared storage (MinIO cluster)

### Vertical Scaling
- Increase server RAM
- Better CPU
- SSD storage
- Higher bandwidth

---

## Rollback Procedure

```bash
# If deployment fails, rollback to previous version
docker-compose down
git checkout previous-commit
docker-compose up -d --build

# Or keep multiple versions
docker tag social-app-backend:latest social-app-backend:backup
```

---

**Last Updated**: December 5, 2025

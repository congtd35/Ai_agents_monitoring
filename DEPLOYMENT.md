# Deployment Guide - AI Agents Monitoring System

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- pnpm package manager

### 1. Clone Repository
```bash
git clone <repository-url>
cd ai_agents_monitoring
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m app.main
```
Backend will be available at: http://localhost:8000

### 3. Frontend Setup
```bash
cd frontend
pnpm install
pnpm run dev
```
Frontend will be available at: http://localhost:5173

## 🏗️ Production Deployment

### Backend Production Setup

#### 1. Environment Configuration
Create `.env` file in backend directory:
```env
DATABASE_URL=sqlite:///./ai_agents.db
SECRET_KEY=your-super-secret-key-change-in-production-please
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://yourdomain.com
API_V1_STR=/api/v1
PROJECT_NAME=AI Agents Monitoring System
```

#### 2. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### 3. Run Production Server
```bash
# Using uvicorn directly
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Or using gunicorn for production
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend Production Setup

#### 1. Environment Configuration
Create `.env` file in frontend directory:
```env
VITE_API_BASE_URL=http://localhost:8000
# For production, change to your actual API URL
# VITE_API_BASE_URL=https://api.yourdomain.com
```

#### 2. Build for Production
```bash
cd frontend
pnpm install
pnpm run build
```

#### 3. Serve Built Files
```bash
# Using a simple HTTP server
npx serve -s dist -l 3000

# Or using nginx (recommended)
# Copy dist/ contents to your nginx web root
```

## 🐳 Docker Deployment

### Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile
```dockerfile
FROM node:20-alpine as builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./ai_agents.db
      - SECRET_KEY=your-super-secret-key
    volumes:
      - ./backend/data:/app/data

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - VITE_API_BASE_URL=http://localhost:8000
```

## ☁️ Cloud Deployment Options

### 1. Heroku Deployment

#### Backend (Heroku)
```bash
# Install Heroku CLI
# Create Procfile in backend directory
echo "web: uvicorn app.main:app --host 0.0.0.0 --port \$PORT" > Procfile

# Deploy
heroku create your-app-name-backend
heroku config:set SECRET_KEY=your-secret-key
git subtree push --prefix backend heroku main
```

#### Frontend (Netlify/Vercel)
```bash
# Build command: pnpm run build
# Publish directory: dist
# Environment variables: VITE_API_BASE_URL=https://your-backend.herokuapp.com
```

### 2. AWS Deployment

#### Backend (AWS EC2 + RDS)
```bash
# Launch EC2 instance
# Install dependencies
sudo apt update
sudo apt install python3-pip nginx

# Clone and setup application
git clone <repository>
cd ai_agents_monitoring/backend
pip3 install -r requirements.txt

# Configure nginx reverse proxy
sudo nano /etc/nginx/sites-available/ai-agents-backend

# Start application with systemd
sudo nano /etc/systemd/system/ai-agents.service
sudo systemctl enable ai-agents
sudo systemctl start ai-agents
```

#### Frontend (AWS S3 + CloudFront)
```bash
# Build application
pnpm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Configure CloudFront distribution
# Set origin to S3 bucket
# Configure custom error pages for SPA routing
```

### 3. Google Cloud Platform

#### Backend (Cloud Run)
```bash
# Create cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/ai-agents-backend', './backend']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/ai-agents-backend']

# Deploy
gcloud run deploy ai-agents-backend \
  --image gcr.io/$PROJECT_ID/ai-agents-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Frontend (Firebase Hosting)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase
firebase init hosting

# Configure firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}

# Deploy
firebase deploy
```

## 🔧 Production Configuration

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/ai-agents-frontend;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL Configuration (Let's Encrypt)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Database Configuration

#### SQLite (Development)
```python
DATABASE_URL = "sqlite:///./ai_agents.db"
```

#### PostgreSQL (Production)
```python
DATABASE_URL = "postgresql://user:password@localhost/ai_agents_db"
```

#### MySQL (Alternative)
```python
DATABASE_URL = "mysql+pymysql://user:password@localhost/ai_agents_db"
```

## 📊 Monitoring & Logging

### Application Monitoring
```python
# Add to main.py
import logging
from fastapi import Request
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url} - {response.status_code} - {process_time:.4f}s")
    return response
```

### Health Checks
```python
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }
```

### Log Rotation
```bash
# Configure logrotate
sudo nano /etc/logrotate.d/ai-agents

/var/log/ai-agents/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload ai-agents
    endscript
}
```

## 🔒 Security Checklist

### Backend Security
- [ ] Change default SECRET_KEY
- [ ] Configure CORS properly
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Validate all inputs
- [ ] Use environment variables for secrets
- [ ] Enable SQL injection protection
- [ ] Configure proper error handling

### Frontend Security
- [ ] Sanitize user inputs
- [ ] Implement CSP headers
- [ ] Use HTTPS for API calls
- [ ] Secure token storage
- [ ] Implement proper logout
- [ ] Validate API responses
- [ ] Handle errors gracefully

### Infrastructure Security
- [ ] Configure firewall rules
- [ ] Use secure database connections
- [ ] Implement backup strategy
- [ ] Monitor system logs
- [ ] Keep dependencies updated
- [ ] Use strong passwords
- [ ] Enable 2FA where possible

## 📈 Performance Optimization

### Backend Optimization
```python
# Add caching
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend

@app.on_event("startup")
async def startup():
    redis = aioredis.from_url("redis://localhost")
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")

# Add compression
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### Frontend Optimization
```javascript
// Code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));

// Bundle analysis
pnpm run build -- --analyze
```

### Database Optimization
```python
# Add indexes
class Task(Base):
    __tablename__ = "tasks"
    
    # Add indexes for frequently queried fields
    __table_args__ = (
        Index('idx_task_project_id', 'project_id'),
        Index('idx_task_status', 'status'),
        Index('idx_task_created_at', 'created_at'),
    )
```

## 🔄 Backup & Recovery

### Database Backup
```bash
# SQLite backup
cp ai_agents.db ai_agents_backup_$(date +%Y%m%d_%H%M%S).db

# PostgreSQL backup
pg_dump ai_agents_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
cp /app/ai_agents.db $BACKUP_DIR/ai_agents_$DATE.db
find $BACKUP_DIR -name "ai_agents_*.db" -mtime +7 -delete
```

### Application Backup
```bash
# Full application backup
tar -czf ai_agents_backup_$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=__pycache__ \
  --exclude=.git \
  ai_agents_monitoring/
```

## 📞 Support & Troubleshooting

### Common Issues

#### Backend Issues
1. **Port already in use**
   ```bash
   lsof -ti:8000 | xargs kill -9
   ```

2. **Database connection errors**
   ```bash
   # Check database file permissions
   ls -la ai_agents.db
   chmod 664 ai_agents.db
   ```

3. **CORS errors**
   ```python
   # Update CORS_ORIGINS in .env
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://yourdomain.com
   ```

#### Frontend Issues
1. **Build failures**
   ```bash
   rm -rf node_modules
   pnpm install
   pnpm run build
   ```

2. **API connection issues**
   ```bash
   # Check VITE_API_BASE_URL in .env
   echo $VITE_API_BASE_URL
   ```

### Logs Location
- Backend logs: `/var/log/ai-agents/`
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`

### Contact Information
- **Technical Support**: support@yourcompany.com
- **Documentation**: https://docs.yourcompany.com
- **Issue Tracker**: https://github.com/yourcompany/ai-agents-monitoring/issues

---

**Last Updated**: July 29, 2025  
**Version**: 1.0.0


# Skillatics Deployment Guide

Complete instructions for deploying Skillatics to production (Railway, Render, Vercel, etc.)

---

## 📋 Pre-Deployment Checklist

### Code Preparation
- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Database indexes created (run `init_db.py`)
- [ ] No hardcoded secrets in code
- [ ] Frontend API URL configurable via env

### Performance Optimization
- [ ] Frontend built for production (`npm run build`)
- [ ] MongoDB queries use indexes
- [ ] Large responses paginated
- [ ] Static assets cached

### Security Hardening
- [ ] JWT secret is strong and unique
- [ ] CORS configured for production domain only
- [ ] Rate limiting implemented (optional but recommended)
- [ ] MongoDB credentials rotated
- [ ] API keys not exposed in frontend

---

## ☁️ Option 1: Railway (Recommended for Full Stack)

Railway provides easy deployment for both backend and frontend with automatic CI/CD.

### Backend Deployment

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Project:**
   ```bash
   cd backend
   railway init
   ```

3. **Add MongoDB:**
   ```bash
   railway add mongodb
   ```
   Railway will auto-provision and set `MONGODB_URL` env variable.

4. **Set Environment Variables:**
   ```bash
   railway variables set JWT_SECRET_KEY=<your-secret>
   railway variables set GEMINI_API_KEY=<your-key>
   railway variables set JUDGE0_API_KEY=<your-key>
   railway variables set SMTP_USER=<email>
   railway variables set SMTP_PASSWORD=<app-password>
   ```

5. **Deploy:**
   ```bash
   railway up
   ```
   Railway will detect Flask and auto-build.

6. **Note Backend URL:**
   Example: `https://skillatics-api.up.railway.app`

### Frontend Deployment

1. **Update API URL:**
   Edit `frontend/src/lib/api.js`:
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://skillatics-api.up.railway.app';
   ```

2. **Deploy Frontend:**
   ```bash
   cd ../frontend
   railway init
   railway variables set VITE_API_URL=https://skillatics-api.up.railway.app
   railway up
   ```

**Done!** Access your app at the provided Railway domain.

---

## 🚀 Option 2: Render (Free Tier Available)

### Backend on Render

1. Create new **Web Service** on Render
2. Connect your GitHub repo
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app` (install gunicorn first)
   - **Environment**: Python 3
4. Add environment variables via Render dashboard
5. Deploy

### Frontend on Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   cd frontend
   vercel
   ```
2. Set environment variable:
   ```
   VITE_API_URL=https://skillatics-api.onrender.com
   ```
3. Deploy: `vercel --prod`

---

## 🐳 Option 3: Docker Compose (Self-Hosted)

### 1. Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: skillatics-db
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  backend:
    build: ./backend
    container_name: skillatics-api
    restart: always
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongodb:27017/skillatics
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - JUDGE0_API_KEY=${JUDGE0_API_KEY}
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    container_name: skillatics-web
    restart: always
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://localhost:5000
    depends_on:
      - backend

volumes:
  mongo-data:
```

### 2. Create `backend/Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

### 3. Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 4. Deploy:

```bash
docker-compose up -d
```

Access at `http://localhost`

---

## 🌐 Domain & SSL Setup

### Using Cloudflare (Recommended)
1. Add your domain to Cloudflare
2. Point DNS to deployment platform:
   - Railway: CNAME to `<project>.up.railway.app`
   - Render: CNAME to `<project>.onrender.com`
3. Enable SSL (Cloudflare auto-provisions)
4. Set SSL mode to "Full"

### Using Let's Encrypt (Self-Hosted)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d skillatics.com -d www.skillatics.com
```

---

## 📊 Monitoring & Analytics

### Backend Monitoring
- **Sentry**: Error tracking
  ```bash
  pip install sentry-sdk[flask]
  ```
  Add to `app.py`:
  ```python
  import sentry_sdk
  sentry_sdk.init(dsn="<your-dsn>")
  ```

- **New Relic**: Performance monitoring

### Frontend Monitoring
- **Google Analytics**: User tracking
- **Vercel Analytics**: Built-in metrics

### Database Monitoring
- **MongoDB Atlas Alerts**: Set up email alerts for:
  - CPU usage >80%
  - Storage >90%
  - Connection spikes

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm i -g @railway/cli
          railway link ${{ secrets.RAILWAY_PROJECT_ID }}
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          npm i -g vercel
          cd frontend
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 🛡️ Production Environment Variables

### Backend (.env)
```bash
# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/skillatics

# Security
JWT_SECRET_KEY=<64-char-random-string>
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=2592000

# APIs
GEMINI_API_KEY=<your-gemini-key>
JUDGE0_API_KEY=<your-judge0-key>
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@skillatics.com
SMTP_PASSWORD=<app-password>

# Optional
SENTRY_DSN=<your-sentry-dsn>
FLASK_ENV=production
```

### Frontend (.env)
```bash
VITE_API_URL=https://api.skillatics.com
VITE_GA_ID=G-XXXXXXXXXX  # Google Analytics (optional)
```

---

## 🧪 Post-Deployment Verification

Run these checks after deployment:

1. **Health Check:**
   ```bash
   curl https://api.skillatics.com/health
   # Expected: {"status": "healthy"}
   ```

2. **Authentication:**
   - Register new user → Verify OTP email sent
   - Login → Verify JWT returned

3. **Test Features:**
   - Start adaptive test → Complete → Check results
   - Take coding test → Verify execution
   - Check leaderboard → Verify rankings

4. **Performance:**
   - Run Lighthouse test (aim for >90 score)
   - Check backend response times (<500ms for most endpoints)

5. **Security Scan:**
   ```bash
   npm install -g snyk
   snyk test
   ```

---

## 📈 Scaling Considerations

### Database
- **MongoDB Atlas M10+** for production workloads
- Enable sharding if >1M documents
- Use read replicas for analytics queries

### Backend
- **Horizontal Scaling**: Deploy multiple instances behind load balancer
- **Caching**: Use Redis for frequent queries (question pools, leaderboards)
- **Background Jobs**: Use Celery for async tasks (XP calculations, email sending)

### Frontend
- **CDN**: Use Cloudflare or Vercel Edge Network
- **Code Splitting**: Lazy load routes
- **Image Optimization**: Use WebP format

---

## 🆘 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **CORS errors** | Add production domain to `CORS(origins=[...])` in `app.py` |
| **MongoDB connection timeout** | Check IP whitelist in MongoDB Atlas |
| **Judge0 rate limit** | Upgrade plan or implement request queue |
| **OTP emails not sending** | Verify SMTP credentials, check spam folder |
| **Frontend blank page** | Check browser console, verify API URL |

### Rollback Procedure
```bash
# Railway
railway rollback

# Vercel
vercel rollback

# Docker
docker-compose down
git checkout <previous-commit>
docker-compose up -d
```

---

## ✅ Launch Checklist

Before announcing to users:

- [ ] All tests passing
- [ ] SSL certificate valid
- [ ] Custom domain configured
- [ ] Email notifications working
- [ ] Error tracking enabled (Sentry)
- [ ] Backups configured (MongoDB Atlas auto-backup)
- [ ] Status page created (e.g., status.skillatics.com)
- [ ] Support email set up
- [ ] Privacy policy & terms of service published
- [ ] Demo video recorded

---

**Deployment Complete! 🎉**

Monitor logs for the first 24 hours:
```bash
# Railway
railway logs

# Render
# View logs in dashboard

# Docker
docker-compose logs -f
```

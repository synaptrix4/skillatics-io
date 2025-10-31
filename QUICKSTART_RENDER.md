# Quick Start: Deploy to Render in 10 Minutes

## What You'll Need
- GitHub account
- Render account (free)
- MongoDB Atlas account (free)

## Step 1: MongoDB Setup (3 minutes)

1. Go to mongodb.com/atlas and sign up
2. Create a free cluster
3. Create database user with password
4. Whitelist all IPs (0.0.0.0/0)
5. Get connection string and add database name at end

Example: `mongodb+srv://user:pass@cluster.mongodb.net/skillatics`

## Step 2: Push to GitHub (2 minutes)

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

## Step 3: Deploy on Render (5 minutes)

### Using Blueprint (Easiest):

1. Go to dashboard.render.com
2. Click "New" → "Blueprint"
3. Connect your GitHub repo
4. Render finds render.yaml automatically
5. Fill in these environment variables:
   - MONGO_URI: (paste your MongoDB connection string)
   - SMTP_USER: (your Gmail - optional for now)
   - SMTP_PASS: (Gmail app password - optional for now)
6. Click "Apply"
7. Wait 5-10 minutes for deployment

### Manual Method:

**Backend:**
1. New → Web Service
2. Connect repo
3. Settings:
   - Root Directory: `backend`
   - Build: `pip install -r requirements.txt`
   - Start: `gunicorn app:app`
4. Add MONGO_URI and JWT_SECRET_KEY
5. Deploy

**Frontend:**
1. New → Static Site
2. Connect repo
3. Settings:
   - Root Directory: `frontend`
   - Build: `npm install && npm run build`
   - Publish: `dist`
4. Add VITE_API_URL: `https://your-backend.onrender.com/api`
5. Deploy

## Step 4: Initialize Database

After backend deploys, go to backend service → Shell:

```bash
python scripts/init_db.py
```

## Step 5: Test

Visit your frontend URL and try:
- Register new user
- Login
- View dashboard

## Done!

Your app is now live. URLs will look like:
- Backend: https://skillatics-backend.onrender.com
- Frontend: https://skillatics-frontend.onrender.com

## Optional: Gmail Setup for OTP

1. Google Account → Security → 2-Step Verification
2. App passwords → Generate for Mail
3. Add to Render as SMTP_USER and SMTP_PASS

## Need Help?

See full DEPLOYMENT.md for detailed instructions and troubleshooting.

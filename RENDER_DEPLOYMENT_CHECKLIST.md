# Render Deployment Checklist

Use this checklist to ensure a smooth deployment to Render.

## Pre-Deployment Checklist

### MongoDB Atlas Setup
- [ ] Created MongoDB Atlas account
- [ ] Created free cluster
- [ ] Created database user with password
- [ ] Whitelisted all IPs (0.0.0.0/0) in Network Access
- [ ] Obtained connection string
- [ ] Added database name to connection string (e.g., /skillatics)
- [ ] Tested connection string locally (optional)

### Code Repository
- [ ] Code is pushed to GitHub
- [ ] All changes are committed
- [ ] Repository is public or Render has access

### Gmail Setup (Optional - for OTP emails)
- [ ] Enabled 2-Factor Authentication on Gmail
- [ ] Generated App Password for Mail
- [ ] Saved app password securely

## Deployment Checklist

### Backend Deployment
- [ ] Created Web Service on Render
- [ ] Connected GitHub repository
- [ ] Set Root Directory to `backend`
- [ ] Set Build Command: `pip install -r requirements.txt`
- [ ] Set Start Command: `gunicorn app:app`
- [ ] Added environment variable: MONGO_URI
- [ ] Added environment variable: JWT_SECRET_KEY (auto-generated or custom)
- [ ] Added environment variable: SMTP_USER (if using email)
- [ ] Added environment variable: SMTP_PASS (if using email)
- [ ] Deployment completed successfully
- [ ] Copied backend URL

### Frontend Deployment
- [ ] Created Static Site on Render
- [ ] Connected GitHub repository
- [ ] Set Root Directory to `frontend`
- [ ] Set Build Command: `npm install && npm run build`
- [ ] Set Publish Directory to `dist`
- [ ] Added environment variable: VITE_API_URL (backend URL + /api)
- [ ] Deployment completed successfully
- [ ] Copied frontend URL

### Post-Deployment
- [ ] Initialized database using Shell or locally
- [ ] Tested health endpoint: `https://your-backend.onrender.com/api/health`
- [ ] Visited frontend URL
- [ ] Tested user registration
- [ ] Tested OTP email delivery (if configured)
- [ ] Tested user login
- [ ] Tested student dashboard
- [ ] Tested admin features (if applicable)

## Environment Variables Reference

### Backend
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/skillatics
JWT_SECRET_KEY=your-secret-key-here
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend
```
VITE_API_URL=https://your-backend.onrender.com/api
```

## Troubleshooting Checklist

### If Backend Fails to Deploy
- [ ] Check build logs for errors
- [ ] Verify requirements.txt has all dependencies
- [ ] Verify gunicorn is in requirements.txt
- [ ] Check MONGO_URI format is correct
- [ ] Verify MongoDB Atlas allows connections from 0.0.0.0/0

### If Frontend Fails to Deploy
- [ ] Check build logs for errors
- [ ] Verify package.json has all dependencies
- [ ] Check if build command completes successfully
- [ ] Verify dist directory is created during build

### If App Doesn't Work
- [ ] Check backend logs for errors
- [ ] Verify VITE_API_URL is set correctly in frontend
- [ ] Test backend health endpoint directly
- [ ] Check browser console for CORS errors
- [ ] Verify database was initialized (run init_db.py)
- [ ] Check MongoDB Atlas connection from backend logs

## URLs to Save

```
Backend URL: ___________________________________
Frontend URL: ___________________________________
MongoDB Connection String: ___________________________________
GitHub Repository: ___________________________________
```

## Notes

- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Consider upgrading to paid plan for production use
- Monitor usage in Render dashboard

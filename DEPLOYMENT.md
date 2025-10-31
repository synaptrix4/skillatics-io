# Deploying Skillatics to Render

This guide will walk you through deploying the Skillatics platform to Render.

## Prerequisites

1. **GitHub Account**: Your code should be pushed to a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **MongoDB Atlas Account**: For cloud MongoDB database (free tier at mongodb.com/atlas)

## Architecture Overview

The deployment consists of two services:
- **Backend API**: Python Flask application (Web Service)
- **Frontend**: React static site (Static Site)

## Step-by-Step Deployment Guide

### 1. Set Up MongoDB Atlas (Database)

1. Go to MongoDB Atlas and create a free account
2. Create a new cluster (select the free tier)
3. Create a database user:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password (save these!)
   - Grant "Read and write to any database" role
4. Whitelist IP addresses:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
5. Get your connection string:
   - Go to "Database" then "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace password placeholder with your actual password
   - Add database name at the end: mongodb+srv://username:password@cluster.xxxxx.mongodb.net/skillatics

### 2. Push Your Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit for Render deployment"
git remote add origin https://github.com/yourusername/skillatics-io.git
git push -u origin main
```

### 3. Deploy Backend on Render

#### Option A: Using Blueprint (Recommended)

1. Log in to Render Dashboard
2. Click "New" then "Blueprint"
3. Connect your GitHub repository
4. Render will detect the render.yaml file
5. Set the environment variables:
   - MONGO_URI: Your MongoDB Atlas connection string
   - JWT_SECRET_KEY: Will be auto-generated
   - SMTP_USER: Your Gmail address
   - SMTP_PASS: Your Gmail app password
6. Click "Apply" to deploy both services

#### Option B: Manual Deployment

**Deploy Backend:**

1. Log in to Render Dashboard
2. Click "New" then "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - Name: skillatics-backend
   - Region: Choose closest to your users
   - Branch: main
   - Root Directory: backend
   - Runtime: Python 3
   - Build Command: pip install -r requirements.txt
   - Start Command: gunicorn app:app
5. Select the Free plan
6. Add Environment Variables:
   - MONGO_URI: Your MongoDB Atlas connection string
   - JWT_SECRET_KEY: Generate strong random string
   - SMTP_SERVER: smtp.gmail.com
   - SMTP_PORT: 465
   - SMTP_USER: Your Gmail address
   - SMTP_PASS: Your Gmail app password
   - PORT: 10000
7. Click "Create Web Service"
8. Copy your backend URL

**Deploy Frontend:**

1. Click "New" then "Static Site"
2. Connect your GitHub repository
3. Configure the service:
   - Name: skillatics-frontend
   - Branch: main
   - Root Directory: frontend
   - Build Command: npm install && npm run build
   - Publish Directory: dist
4. Add Environment Variable:
   - VITE_API_URL: Your backend URL + /api
5. Click "Create Static Site"

### 4. Set Up Gmail for OTP Emails

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Go to Security then 2-Step Verification then App passwords
4. Generate a new app password for Mail
5. Copy the 16-character password
6. Add it as SMTP_PASS environment variable in Render

### 5. Initialize the Database

After backend deployment, initialize the database:

1. Go to your backend service in Render
2. Click on "Shell" tab
3. Run: python scripts/init_db.py

Or run locally with MongoDB URI set:
```bash
cd backend
export MONGO_URI="your-mongodb-atlas-uri"
python scripts/init_db.py
```

### 6. Test Your Deployment

1. Visit your frontend URL
2. Try registering a new user
3. Check if OTP email is received
4. Test login and dashboard features

## Important Notes

### Free Tier Limitations

- Services spin down after 15 minutes of inactivity
- First request after inactivity may take 30-60 seconds
- 750 hours/month of runtime per service

### Environment Variables Reference

**Backend Required:**
- MONGO_URI: MongoDB connection string
- JWT_SECRET_KEY: Secret key for JWT tokens

**Backend Optional:**
- SMTP_SERVER: SMTP server (default: smtp.gmail.com)
- SMTP_PORT: SMTP port (default: 465)
- SMTP_USER: Email address for sending OTPs
- SMTP_PASS: Email password/app password

**Frontend:**
- VITE_API_URL: Full URL to backend API

### Custom Domain (Optional)

1. Go to your Static Site settings in Render
2. Click "Custom Domain"
3. Add your domain
4. Update DNS records as instructed
5. SSL certificate will be provisioned automatically

## Troubleshooting

### Backend won't start
- Check logs for errors
- Verify MONGO_URI is correct
- Ensure all required environment variables are set

### Frontend can't connect to backend
- Verify VITE_API_URL is set correctly
- Check CORS settings in backend
- Ensure backend is running

### OTP emails not sending
- Verify Gmail app password is correct
- Check SMTP environment variables
- Review backend logs for email errors

### Database connection issues
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check database user has correct permissions
- Ensure connection string includes database name

## Updating Your Deployment

To update your deployed application:

1. Push changes to GitHub
2. Render will automatically detect and redeploy
3. Monitor deployment progress in Render dashboard

## Cost Optimization

For production use, consider:
- Upgrading to paid plans to avoid cold starts
- Using a CDN for frontend assets
- Implementing caching strategies
- Monitoring usage and scaling accordingly

# Quick Start: Deploying to Render (FREE TIER)

This repository is now configured for easy deployment to Render using **100% free services**! 🚀

## What Was Added

✅ **render.yaml** - One-click deployment configuration (FREE tier)
✅ **requirements.txt** - Python dependencies  
✅ **npm start** script - Backend startup command
✅ **Environment variable support** - Both servers now use env vars
✅ **Comprehensive documentation** - See RENDER_DEPLOYMENT.md

## Deploy in 3 Steps (FREE)

### 1. Prerequisites
- Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database (**FREE M0 tier** available)
  - 📖 See **[MONGODB_SETUP_GUIDE.md](MONGODB_SETUP_GUIDE.md)** for detailed step-by-step instructions
- Get a Gmail App Password for email functionality ([instructions](https://support.google.com/accounts/answer/185833))

### 2. Deploy to Render (FREE)
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Blueprint**
3. Connect this GitHub repository
4. Render will detect `render.yaml` automatically
5. Both services will be deployed on the **FREE tier**

### 3. Configure Environment Variables
When prompted, set these variables:

**For nbnc-backend:**
```
MONGODB_URI=your-mongodb-atlas-connection-string
EMAIL_USER=your-email@gmail.com  
EMAIL_PASS=your-gmail-app-password
FRONTEND_URL=your-frontend-url
```

**For nbnc-video-processor:**
```
MONGODB_URI=your-mongodb-atlas-connection-string
```

That's it! Render will deploy both services automatically on the **FREE tier**.

## What Gets Deployed (FREE TIER)

Both services are configured to use Render's **free tier** (`plan: free`):

- **Node.js Backend** (`https://nbnc-backend-xxx.onrender.com`)
  - Handles user authentication
  - Manages sessions and user data
  - Sends verification emails
  - **FREE tier**: 512 MB RAM, spins down after 15 min inactivity

- **Python Video Processor** (`https://nbnc-video-processor-xxx.onrender.com`)
  - Processes basketball shot videos
  - Performs shot analysis
  - Tracks shooting metrics
  - **FREE tier**: 512 MB RAM, spins down after 15 min inactivity

## Next Steps

After deployment:
1. Note your backend URLs from Render dashboard
2. Update your frontend deployment with:
   ```
   VITE_API_BASE_URL=https://nbnc-backend-xxx.onrender.com
   VITE_ANALYSIS_API_URL=https://nbnc-video-processor-xxx.onrender.com
   ```
3. Test the endpoints to ensure they're working

## Need Help?

📖 **Documentation:**
- **[MONGODB_SETUP_GUIDE.md](MONGODB_SETUP_GUIDE.md)** - Complete MongoDB setup walkthrough
- **[RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)** - Detailed Render deployment guide

**RENDER_DEPLOYMENT.md includes:**
- Detailed step-by-step instructions
- Troubleshooting guide
- Gmail configuration
- Free tier information

## Understanding the FREE Tier

✅ **What you get FREE:**
- 2 web services (Node.js + Python)
- 512 MB RAM per service
- Automatic HTTPS
- Custom domains (optional)
- MongoDB Atlas M0 FREE tier (512 MB storage)

⚠️ **Free tier limitations:**
- Services spin down after 15 minutes of inactivity
- First request after spin down takes 30-50 seconds (cold start)
- 750 hours/month of runtime per service
- No persistent disk storage

💡 **Tips for FREE tier:**
- Perfect for development, testing, and hobby projects
- Keep services active by pinging them periodically
- Use MongoDB Atlas M0 FREE tier for database
- All services remain completely FREE forever

## Total Cost

**Everything on FREE tier**: **$0/month** 🎉
- Render Node.js service: FREE
- Render Python service: FREE  
- MongoDB Atlas M0: FREE
- **Total: $0/month**

---

**Questions?** Open an issue or check RENDER_DEPLOYMENT.md

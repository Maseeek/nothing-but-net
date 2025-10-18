# Quick Start: Deploying to Render

This repository is now configured for easy deployment to Render! 🚀

## What Was Added

✅ **render.yaml** - One-click deployment configuration
✅ **requirements.txt** - Python dependencies  
✅ **npm start** script - Backend startup command
✅ **Environment variable support** - Both servers now use env vars
✅ **Comprehensive documentation** - See RENDER_DEPLOYMENT.md

## Deploy in 3 Steps

### 1. Prerequisites
- Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database (free tier available)
- Get a Gmail App Password for email functionality ([instructions](https://support.google.com/accounts/answer/185833))

### 2. Deploy to Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Blueprint**
3. Connect this GitHub repository
4. Render will detect `render.yaml` automatically

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

That's it! Render will deploy both services automatically.

## What Gets Deployed

- **Node.js Backend** (`https://nbnc-backend-xxx.onrender.com`)
  - Handles user authentication
  - Manages sessions and user data
  - Sends verification emails

- **Python Video Processor** (`https://nbnc-video-processor-xxx.onrender.com`)
  - Processes basketball shot videos
  - Performs shot analysis
  - Tracks shooting metrics

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

See **RENDER_DEPLOYMENT.md** for:
- Detailed step-by-step instructions
- Troubleshooting guide
- MongoDB Atlas setup
- Gmail configuration
- Cost information

## Free Tier Limitations

⚠️ Free tier services spin down after 15 minutes of inactivity
- First request after spin down takes 30+ seconds
- Consider paid tier ($7/month per service) for production

## Cost Estimate

**Free tier**: $0/month (both services + MongoDB Atlas M0)
**Production setup**: ~$23/month (both services + MongoDB Atlas M2)

---

**Questions?** Open an issue or check RENDER_DEPLOYMENT.md

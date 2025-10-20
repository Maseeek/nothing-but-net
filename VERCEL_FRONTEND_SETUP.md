# Vercel Frontend Setup Guide

This guide walks you through deploying the NothingButNet frontend on Vercel and connecting it to your Render backend.

## Prerequisites

Before starting, make sure you have:
- ✅ Backend deployed on Render (both Node.js and Python services)
- ✅ Backend URLs from Render (e.g., `https://nbnc-backend-xxxx.onrender.com`)
- ✅ MongoDB Atlas database set up and connected to backend
- ✅ A [Vercel](https://vercel.com) account (FREE)

---

## Step-by-Step Setup

### Step 1: Get Your Backend URLs

From your Render dashboard, copy the URLs for both backend services:

1. **Node.js Backend URL**: `https://nbnc-backend-xxxx.onrender.com`
   - This handles authentication, user management, and sessions
2. **Python Video Processor URL**: `https://nbnc-video-processor-xxxx.onrender.com`
   - This handles video processing and shot analysis

**Important:** Copy the full URLs including `https://`

### Step 2: Update Backend CORS Configuration

Before deploying the frontend, update your Render backend environment variables to allow requests from Vercel:

1. Go to your **Render Dashboard**
2. Select your **nbnc-backend** service
3. Go to **Environment** tab
4. Update or add these variables:
   ```
   FRONTEND_URL=https://your-app-name.vercel.app
   ```
   (You'll update this with your actual Vercel URL after Step 3)

For now, you can also add a temporary placeholder or use `*` during initial setup.

### Step 3: Deploy Frontend to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Sign up / Log in to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub (recommended) or email
   - **FREE** - No credit card required

2. **Import Your Repository:**
   - Click **"Add New..."** → **"Project"**
   - Select **"Import Git Repository"**
   - Choose your GitHub repository (`Maseeek/nbnc`)
   - Click **"Import"**

3. **Configure Build Settings:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave as is)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Add Environment Variables:**
   
   Click **"Environment Variables"** and add:
   
   ```
   VITE_API_BASE_URL=https://nbnc-backend-xxxx.onrender.com
   VITE_ANALYSIS_API_URL=https://nbnc-video-processor-xxxx.onrender.com
   ```
   
   **Replace** `xxxx` with your actual Render service IDs.
   
   **Important:** 
   - Variable names MUST start with `VITE_` for Vite to include them
   - Include the full URLs with `https://`
   - Do NOT add trailing slashes

5. **Deploy:**
   - Click **"Deploy"**
   - Wait 2-3 minutes for the build to complete
   - Vercel will provide a URL like: `https://nbnc-xxxx.vercel.app`

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from your project directory
cd /path/to/nbnc
vercel

# Follow the prompts:
# - Set up and deploy: Yes
# - Which scope: Your account
# - Link to existing project: No
# - Project name: nbnc
# - Directory: ./
# - Override settings: No

# Set environment variables
vercel env add VITE_API_BASE_URL
# Enter: https://nbnc-backend-xxxx.onrender.com

vercel env add VITE_ANALYSIS_API_URL
# Enter: https://nbnc-video-processor-xxxx.onrender.com

# Deploy to production
vercel --prod
```

### Step 4: Update Backend CORS with Vercel URL

Now that you have your Vercel URL:

1. Go back to **Render Dashboard**
2. Select your **nbnc-backend** service
3. Go to **Environment** tab
4. Update the `FRONTEND_URL` variable:
   ```
   FRONTEND_URL=https://nbnc-xxxx.vercel.app
   ```
   (Use your actual Vercel URL)

5. Click **"Save Changes"**
6. Wait for the backend to redeploy (automatic, takes 1-2 minutes)

### Step 5: Verify the Connection

1. **Visit your Vercel URL:** `https://nbnc-xxxx.vercel.app`

2. **Open browser developer tools:**
   - Right-click → Inspect → Console tab

3. **Test the connection:**
   - Try registering a new user
   - Check the Console for any CORS errors
   - Check the Network tab to see API requests

4. **Expected behavior:**
   - No CORS errors
   - API requests go to your Render backend
   - User registration/login works
   - Video processing works

### Step 6: Configure Custom Domain (Optional)

If you have a custom domain:

1. In Vercel Dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS
5. Update `FRONTEND_URL` in Render backend to your custom domain

---

## Environment Variables Reference

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Node.js backend URL from Render | `https://nbnc-backend-xxxx.onrender.com` |
| `VITE_ANALYSIS_API_URL` | Python video processor URL from Render | `https://nbnc-video-processor-xxxx.onrender.com` |

### Backend (Render)

| Variable | Description | Example |
|----------|-------------|---------|
| `FRONTEND_URL` | Your Vercel frontend URL | `https://nbnc-xxxx.vercel.app` |
| `PRODUCTION_FRONTEND_URL` | Additional frontend URL (optional) | Custom domain if you have one |

---

## Troubleshooting

### CORS Errors

**Symptom:** Browser console shows CORS errors like:
```
Access to fetch at 'https://nbnc-backend-xxxx.onrender.com/api/...' from origin 'https://nbnc-xxxx.vercel.app' has been blocked by CORS policy
```

**Solution:**
1. Check that `FRONTEND_URL` in Render matches your Vercel URL exactly
2. Make sure both URLs use `https://` (no trailing slash)
3. Wait 1-2 minutes after updating environment variables for Render to redeploy
4. Clear browser cache or try incognito mode

### API Calls Failing

**Symptom:** API requests timeout or fail

**Solutions:**
1. **Backend Cold Start:** Free tier Render services spin down after 15 minutes
   - First request takes 30-50 seconds (normal behavior)
   - Subsequent requests are fast
   
2. **Check Environment Variables:**
   - In Vercel: Settings → Environment Variables
   - Make sure `VITE_API_BASE_URL` and `VITE_ANALYSIS_API_URL` are correct
   - Redeploy after changing: Deployments → Click ⋯ → Redeploy

3. **Check Backend Status:**
   - Visit your backend URL directly: `https://nbnc-backend-xxxx.onrender.com`
   - You should see: "Server is running 🚀"
   - If it times out, wait 30 seconds and try again (cold start)

### Environment Variables Not Working

**Symptom:** Frontend still trying to connect to `localhost`

**Solution:**
1. Make sure variables start with `VITE_` prefix
2. Variables are set at **build time**, not runtime
3. After changing variables, you MUST **redeploy**:
   - Vercel Dashboard → Deployments → Click ⋯ → Redeploy
4. Check the build logs to confirm variables were included

### Build Fails on Vercel

**Symptom:** Vercel build fails with errors

**Solutions:**
1. **Check Build Command:** Should be `npm run build`
2. **Check Node Version:** 
   - Vercel uses Node 18.x by default
   - If needed, specify version in `package.json`:
     ```json
     "engines": {
       "node": ">=18.0.0"
     }
     ```
3. **Check Dependencies:** Run `npm install` locally to verify
4. **Check Build Logs:** Vercel shows detailed error messages

---

## Automatic Deployments

Once set up, Vercel automatically redeploys when you push to GitHub:

1. **Push code to GitHub:**
   ```bash
   git push origin main
   ```

2. **Vercel detects changes** and builds automatically

3. **View deployment:**
   - Get notification email
   - Check Vercel Dashboard → Deployments
   - Preview before promoting to production

**Branch Previews:**
- Each branch gets a preview URL
- Pull requests get automatic preview deployments
- Test before merging to main

---

## Configuration Files

### vercel.json (Already Configured)

The repository includes `vercel.json` for client-side routing:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures React Router works correctly with page refreshes.

### .env.client.example (Reference)

Use this as a template for local development:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_ANALYSIS_API_URL=http://localhost:5000
```

For production (Vercel), set these in the Vercel dashboard instead.

---

## Cost

**Vercel Hobby Plan (FREE):**
- Unlimited deployments
- Automatic HTTPS
- Automatic preview deployments
- 100 GB bandwidth/month
- Serverless Functions (if needed)
- **Cost: $0/month** 🎉

**Combined FREE Stack:**
- Frontend (Vercel): $0/month
- Backend (Render): $0/month
- Database (MongoDB Atlas): $0/month
- Email (Gmail): $0/month
- **Total: $0/month** 🎉

---

## Complete Deployment Checklist

- [ ] MongoDB Atlas database created and configured
- [ ] Email (Gmail) app password generated
- [ ] Backend deployed to Render (both services)
- [ ] Backend environment variables set (including `FRONTEND_URL`)
- [ ] Frontend environment variables prepared (`VITE_API_BASE_URL`, `VITE_ANALYSIS_API_URL`)
- [ ] Frontend deployed to Vercel
- [ ] Backend `FRONTEND_URL` updated with actual Vercel URL
- [ ] CORS working (no errors in browser console)
- [ ] User registration/login tested
- [ ] Video processing tested
- [ ] Automatic deployments configured

---

## Next Steps

After successful deployment:

1. **Test All Features:**
   - User registration and email verification
   - Login and authentication
   - Video upload and processing
   - Session tracking and statistics

2. **Monitor Performance:**
   - Check Vercel Analytics (included FREE)
   - Monitor Render logs for backend errors
   - Track API response times

3. **Set Up Custom Domain (Optional):**
   - Purchase domain from any provider
   - Configure in Vercel Settings → Domains
   - Update `FRONTEND_URL` in Render backend

4. **Enable Analytics (Optional):**
   - Vercel Analytics is already installed (`@vercel/analytics`)
   - Check package.json dependencies
   - View analytics in Vercel Dashboard

---

## Summary

**What You've Deployed:**

✅ **Frontend on Vercel (FREE)**
- React app with Vite
- Automatic HTTPS
- Automatic deployments from GitHub
- Preview deployments for PRs

✅ **Backend on Render (FREE)**
- Node.js API server
- Python video processor
- Connected to MongoDB Atlas
- Configured CORS for Vercel

✅ **Complete Stack ($0/month)**
- Everything running on FREE tiers
- Professional deployment setup
- Automatic deployments
- No credit card required

Your NothingButNet app is now fully deployed and accessible! 🎉

---

## Support Links

- **Vercel Documentation:** https://vercel.com/docs
- **Render Documentation:** https://render.com/docs
- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas/
- **Repository Issues:** Create an issue in the GitHub repository

# Quick Setup Guide

This guide helps you quickly set up the application with the new environment variable configuration.

## What Changed?

All hardcoded `localhost` URLs have been replaced with environment variables. This allows your application to work seamlessly in both development and production environments.

## Quick Start

### For Development (Localhost)

The application still works with localhost by default. No configuration needed!

```bash
npm install
# Run frontend, backend, and python server concurrently
npm run dev-all
```

The app will use these defaults:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Analysis API: `http://localhost:5000`

### For Production Deployment

You need to set environment variables on your hosting platform:

#### Frontend (Vite App)
Set these in your frontend hosting platform (Vercel, Netlify, etc.):
```
VITE_API_BASE_URL=https://your-backend-api.com
VITE_ANALYSIS_API_URL=https://your-analysis-api.com
```

#### Backend (Node.js Server)
Set these on your backend server:
```
FRONTEND_URL=https://your-frontend.com
PRODUCTION_FRONTEND_URL=https://your-custom-domain.com  # optional
```

## Environment Files

Two separate environment files are needed:

1. **Frontend Environment** - `.env` (in project root)
   - Copy from: `.env.client.example`
   - Contains: `VITE_API_BASE_URL`, `VITE_ANALYSIS_API_URL`
   - Variables must start with `VITE_` prefix

2. **Backend Environment** - `src/server/.env`
   - Copy from: `.env.example` (move to src/server/)
   - Contains: Database, email, JWT, FRONTEND_URL settings
   - Located in the same directory as server.js

## Common Deployment Platforms

### Vercel (Frontend)
1. Go to Project Settings → Environment Variables
2. Add `VITE_API_BASE_URL` and `VITE_ANALYSIS_API_URL`
3. Redeploy

### Heroku (Backend)
```bash
heroku config:set FRONTEND_URL=https://your-frontend.vercel.app
heroku config:set MONGODB_URI=your-mongodb-connection-string
```

### Netlify (Frontend)
1. Site Settings → Build & Deploy → Environment
2. Add `VITE_API_BASE_URL` and `VITE_ANALYSIS_API_URL`
3. Trigger new deploy

## Testing Your Setup

1. **Development**: `npm run dev` should work immediately
2. **Production**: After setting env vars, run `npm run build`
3. **Verify**: Check browser console for API call URLs

## Need Help?

## Need Help?

- **Connection Refused in Production?** See `DEPLOYMENT_FIX.md` for the solution.
- For other issues, see `DEPLOYMENT.md` for detailed instructions and troubleshooting.

## Files Modified

- ✅ All client-side JS and React components
- ✅ Server CORS and email configuration
- ✅ Build configuration remains unchanged
- ✅ Backward compatible with development setup

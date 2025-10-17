# Deployment Configuration Guide

This guide explains how to configure the application for different environments (development, staging, production).

## Overview

The application has been updated to use environment variables instead of hardcoded localhost URLs. This allows the same codebase to work seamlessly in development and production environments.

## Environment Variables

### Backend (Server)

Create a `.env` file in the `src/server/` directory with the following variables:

```env
# Server Configuration
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/nbn

# JWT Secret (Use a strong, random secret in production!)
JWT_SECRET=your-secret-key-here

# Email Configuration
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password

# Frontend URL (used for CORS and email verification links)
FRONTEND_URL=http://localhost:5173

# Optional: Additional production frontend URL for CORS
PRODUCTION_FRONTEND_URL=https://your-production-domain.com
```

### Frontend (Client)

Create a `.env` file in the root directory with the following variables:

```env
# API Base URL (Backend server)
VITE_API_BASE_URL=http://localhost:3000

# Analysis API URL (Video processing server)
VITE_ANALYSIS_API_URL=http://localhost:5000
```

**Note:** Environment variables in Vite must be prefixed with `VITE_` to be accessible in the client-side code.

## Development Setup

1. Copy the example files:
   ```bash
   cp .env.example .env
   cp .env.client.example .env
   cp src/server/.env.example src/server/.env
   ```

2. Update the values in the `.env` files as needed for your local development environment.

3. Start the development server:
   ```bash
   npm run dev
   ```

## Production Deployment

### Frontend Deployment

1. Set the environment variables on your hosting platform (Vercel, Netlify, etc.):
   ```
   VITE_API_BASE_URL=https://your-api-domain.com
   VITE_ANALYSIS_API_URL=https://your-analysis-api-domain.com
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Deploy the `dist/` folder to your hosting platform.

### Backend Deployment

1. Set the environment variables on your server:
   ```
   PORT=3000
   MONGODB_URI=mongodb://your-production-db-connection-string
   JWT_SECRET=your-secure-random-secret
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-email-password
   FRONTEND_URL=https://your-frontend-domain.com
   ```

2. Start the server:
   ```bash
   node src/server/server.js
   ```

## Key Changes Made

- All hardcoded `http://localhost:3000` API URLs now use `API_BASE_URL` from config
- All hardcoded `http://localhost:5000` analysis URLs now use `ANALYSIS_API_URL` from config
- Email verification and password reset links now use `FRONTEND_URL` environment variable
- CORS configuration now accepts both development and production URLs
- Development still works with localhost as fallback values

## Files Modified

### Client-side
- `src/client/config.js` - New configuration file for environment variables
- `src/client/js/auth.js` - Updated to use API_BASE_URL
- `src/client/js/videoProcessing.js` - Updated to use API_BASE_URL and ANALYSIS_API_URL
- `src/client/js/userProfile.js` - Updated to use API_BASE_URL
- `src/client/pages/ProfilePage.jsx` - Updated to use API_BASE_URL
- `src/client/pages/ForgotPasswordPage.jsx` - Updated to use API_BASE_URL
- `src/client/pages/ResetPasswordPage.jsx` - Updated to use API_BASE_URL
- `src/client/pages/VerifyEmailPage.jsx` - Updated to use API_BASE_URL
- `src/client/pages/Profile.jsx` - Updated to use API_BASE_URL

### Server-side
- `src/server/server.js` - Updated CORS origins and email links to use FRONTEND_URL

## Verification

To verify the configuration is working:

1. Check that the build completes successfully: `npm run build`
2. Check that no hardcoded localhost URLs remain in the source (except as fallbacks)
3. Test the application with different environment variable values

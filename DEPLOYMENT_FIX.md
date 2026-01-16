# Fixing Connection Refused on Vercel

The "Connection Refused" error happens because your Vercel site is trying to talk to `localhost` instead of your real backend server on Render.

## Step 1: Get Your Backend URL
1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click on your **Node.js Auth Server** service.
3. Copy the URL from the top left (it looks like `https://nbnc-auth-server.onrender.com`).

## Step 2: Configure Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click on your **nbnc** project.
3. Go to **Settings** -> **Environment Variables**.
4. Add the following variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: (Paste the Render URL you copied in Step 1)
5. Click **Save**.

## Step 3: Redeploy
**Crucial Step**: Environment variables only take effect on the *next* deployment.
1. Go to the **Deployments** tab in Vercel.
2. Click the three dots (`...`) next to your latest deployment.
3. Select **Redeploy**.
4. Check the box "Redeploy with existing build cache" (optional, but faster) and click **Redeploy**.

## Verification
1. Once deployed, open your site.
2. Open the Developer Console (**F12** -> **Console**).
3. You should see a message: `API Base URL: https://nbnc-auth-server.onrender.com`.
4. Try to register/login. The error should be gone.

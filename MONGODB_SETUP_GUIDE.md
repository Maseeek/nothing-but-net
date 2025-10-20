# MongoDB Atlas Setup Guide (FREE Tier)

This guide walks you through setting up a FREE MongoDB Atlas database for the NothingButNet backend.

## What You Need to Create

You need to create:
1. **MongoDB Atlas Account** (FREE)
2. **Database Cluster** (FREE M0 tier)
3. **Database User** (username and password)
4. **Database Name** called `nbn`
5. **Network Access Configuration** (whitelist IPs)
6. **Connection String** (to use in Render)

---

## Step-by-Step Setup

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** or **"Sign Up"**
3. Create an account (you can use Google, email, or GitHub)
4. **No credit card required** for the FREE tier

### Step 2: Create a FREE Cluster

1. After logging in, you'll see "Create a Cluster" or "Build a Database"
2. Select **"Shared"** (this is the FREE tier)
3. Choose **M0 Sandbox** (FREE tier with 512 MB storage)
4. Select a cloud provider and region:
   - Recommended: **AWS** in a region close to you
   - Or **Google Cloud** or **Azure**
5. Give your cluster a name (e.g., `nbnc-cluster`)
6. Click **"Create Cluster"**
7. Wait 3-5 minutes for cluster creation

### Step 3: Create a Database User

1. On the left sidebar, click **"Database Access"** under "Security"
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. Enter a username (e.g., `nbnc-admin`)
5. Click **"Autogenerate Secure Password"** or create your own strong password
6. **IMPORTANT:** Copy and save this password securely - you'll need it later!
7. Under "Database User Privileges", select **"Read and write to any database"**
8. Click **"Add User"**

### Step 4: Configure Network Access

1. On the left sidebar, click **"Network Access"** under "Security"
2. Click **"Add IP Address"**
3. Choose one of these options:

   **Option A: Allow access from anywhere (easier, less secure)**
   - Click **"Allow Access from Anywhere"**
   - IP Address will be: `0.0.0.0/0`
   - Click **"Confirm"**

   **Option B: Whitelist Render's IPs (more secure)**
   - You'll need to add these IPs individually:
     - `52.71.158.67`
     - `54.85.219.62`
     - `34.196.200.46`
   - Or check Render's documentation for updated IPs

4. Wait for the status to turn from "Pending" to "Active" (1-2 minutes)

### Step 5: Get Your Connection String

1. Go back to **"Database"** (left sidebar, under "Deployment")
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. Choose:
   - **Driver:** Node.js
   - **Version:** 4.1 or later
5. Copy the connection string that looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Prepare Your Connection String

1. Take the connection string you copied
2. Replace `<username>` with your database username (e.g., `nbnc-admin`)
3. Replace `<password>` with the password you saved in Step 3
4. Add the database name `nbn` after `.net/`:
   ```
   mongodb+srv://nbnc-admin:yourpassword@cluster0.xxxxx.mongodb.net/nbn?retryWrites=true&w=majority
   ```

**Example:**
```
Original: mongodb+srv://<username>:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
Updated:  mongodb+srv://nbnc-admin:MySecurePass123@cluster0.abc123.mongodb.net/nbn?retryWrites=true&w=majority
```

### Step 7: Use in Render

When deploying to Render, use this connection string as the value for the `MONGODB_URI` environment variable.

---

## What Gets Created Automatically

When your backend connects for the first time:
- The database `nbn` will be created automatically (if it doesn't exist)
- Collections (tables) will be created automatically:
  - `users` - for user accounts
  - `sessions` - for shooting sessions
  - `analyses` - for video analysis data

**You don't need to manually create these!** The backend code handles this.

---

## Database Structure

Your MongoDB database will contain:

### Database: `nbn`

#### Collection: `users`
Stores user account information:
- username
- email (lowercase)
- password (hashed)
- emailVerified (boolean)
- verificationToken
- resetPasswordToken
- createdAt, updatedAt

#### Collection: `sessions`
Stores basketball shooting session data:
- userId (reference to user)
- makes, misses
- longestStreak
- average_angle, average_make_angle, average_miss_angle
- fg_percentage
- shot_angles (array)
- shots_results (array)
- total_shots
- sessionDate

#### Collection: `analyses`
Stores video analysis data:
- userId (reference to user)
- totalShots
- madeShots
- fgPercentage
- date

---

## Verifying Your Setup

### Test Connection in MongoDB Atlas

1. Go to **"Database"** in the left sidebar
2. Click **"Browse Collections"** on your cluster
3. If you see collections appearing after your backend runs, it's working!

### Common Issues

**Issue: Can't connect - Authentication failed**
- Solution: Double-check your username and password in the connection string
- Make sure there are no special characters that need URL encoding

**Issue: Can't connect - Connection timeout**
- Solution: Check Network Access settings
- Make sure `0.0.0.0/0` is whitelisted or add Render's IPs

**Issue: Database not appearing**
- Solution: This is normal! The database `nbn` is created when your backend first connects and writes data
- Run your backend and create a user - then the database will appear

---

## Cost

**MongoDB Atlas M0 (FREE tier):**
- Storage: 512 MB (more than enough for development)
- RAM: Shared
- Backups: Automatic
- Cost: **$0/month forever**
- No credit card required
- No time limit

---

## Next Steps

After completing this setup:
1. Copy your final connection string
2. Go to Render deployment
3. Set `MONGODB_URI` environment variable to your connection string
4. Deploy your backend
5. The database collections will be created automatically when you register your first user

---

## Summary

**What you created:**
- ✅ MongoDB Atlas account (FREE)
- ✅ M0 Cluster (FREE tier, 512 MB)
- ✅ Database user with username and password
- ✅ Network access whitelist (0.0.0.0/0 or specific IPs)
- ✅ Connection string formatted with database name `nbn`

**What you'll use in Render:**
- `MONGODB_URI` = Your full connection string with username, password, and database name `nbn`

That's it! Your MongoDB is ready for the NothingButNet backend. 🎉

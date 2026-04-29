# 🚀 AI Tools Hub - Deployment Guide

## Step 1: MongoDB Atlas (Database)

### Sign Up
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Click **"Sign up with Google"** → select your Google account

### Create Free Cluster
1. Choose **M0 Free** tier
2. Provider: AWS | Region: Mumbai (ap-south-1)
3. Cluster Name: `ai-tools-hub`
4. Click **"Create Deployment"**

### Create Database User
1. Username: `ai-hub-admin`
2. Password: Create a strong password (save it!)
3. Click **"Create User"**

### Allow Network Access
1. Click **"Add IP Address"**
2. Click **"Allow Access from Anywhere"** → `0.0.0.0/0`
3. Click **"Confirm"**

### Get Connection String
1. Click **"Choose a connection method"**
2. Click **"Drivers"**
3. Copy the connection string (looks like):
   `mongodb+srv://ai-hub-admin:<password>@cluster0.xxxxx.mongodb.net/ai-tools-hub`
4. Replace `<password>` with your actual password

---

## Step 2: Render (Backend Deployment)

### Sign Up
1. Go to: https://render.com
2. Click **"Get Started for Free"**
3. Click **"Continue with GitHub"** (GitHub account zaruri hai)

### Connect GitHub
- Your project must be on GitHub first!
- If not, push it: `git push` (main help kar sakta hoon)

### Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repo
3. Settings:
   - Name: `ai-tools-hub-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Plan: **Free**

### Environment Variables (Add these in Render)
```
PORT=5000
MONGO_URI=<paste your MongoDB Atlas connection string here>
JWT_SECRET=<generate a strong random string>
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

---

## Step 3: Vercel (Frontend Deployment)

### Sign Up
1. Go to: https://vercel.com
2. Click **"Sign Up"** → **"Continue with GitHub"**

### Deploy
1. Click **"New Project"**
2. Import your GitHub repo
3. Root Directory: `frontend`
4. Framework: Vite
5. Add Environment Variable:
   - `VITE_API_URL` = your Render backend URL (e.g., `https://ai-tools-hub-backend.onrender.com`)
6. Click **"Deploy"**

---

## ✅ Checklist
- [ ] MongoDB Atlas cluster created + connection string copied
- [ ] GitHub repo created and code pushed
- [ ] Render backend deployed + URL noted
- [ ] Vercel frontend deployed
- [ ] Update Render's FRONTEND_URL with Vercel URL
- [ ] Re-run seed data on cloud MongoDB

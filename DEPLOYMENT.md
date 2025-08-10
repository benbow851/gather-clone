# 🚀 Deployment Guide for Gather Clone

This guide will help you deploy your Gather Clone application to Railway (backend) and Vercel (frontend).

## 📋 Prerequisites

- GitHub account with your repository
- Railway account (free tier available)
- Vercel account (free tier available)
- Supabase project (for database and auth)

## 🔧 Step 1: Prepare Your Repository

### 1.1 Commit and Push Your Changes

```bash
# Add all changes
git add .

# Commit the changes
git commit -m "Add Railway and Vercel deployment configuration"

# Push to GitHub
git push origin main
```

### 1.2 Verify Your Repository Structure

Your repository should have:
```
gather-clone/
├── backend/          # Node.js backend
├── frontend/         # Next.js frontend
├── railway.json      # Railway configuration
├── vercel.json       # Vercel configuration
└── env.example       # Environment variables template
```

## 🚂 Step 2: Deploy Backend to Railway

### 2.1 Connect Railway to GitHub

1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `gather-clone` repository
6. Select the `main` branch

### 2.2 Configure Environment Variables

In your Railway project dashboard, add these environment variables:

```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SERVICE_ROLE=your_supabase_service_role

# Agora Video Chat (Optional)
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate
```

### 2.3 Deploy

1. Railway will automatically detect your `railway.json` configuration
2. It will build from the `backend/` directory
3. Deploy using `npm start` command
4. Your backend will be available at: `https://your-project-name.railway.app`

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Connect Vercel to GitHub

1. Go to [Vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your `gather-clone` repository
5. Select the `main` branch

### 3.2 Configure Build Settings

Vercel will automatically detect your `vercel.json` configuration:
- **Framework Preset**: Next.js
- **Root Directory**: `./` (root of repository)
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/.next`

### 3.3 Configure Environment Variables

Add these environment variables in Vercel:

```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.railway.app
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3.4 Deploy

1. Click "Deploy"
2. Vercel will build and deploy your frontend
3. Your frontend will be available at: `https://your-project-name.vercel.app`

## 🔗 Step 4: Update Environment Variables

### 4.1 Update Backend URL in Railway

After getting your Vercel URL, update the `FRONTEND_URL` in Railway:

```bash
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 4.2 Update Frontend Backend URL in Vercel

After getting your Railway URL, update the `NEXT_PUBLIC_BACKEND_URL` in Vercel:

```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.railway.app
```

## ✅ Step 5: Test Your Deployment

### 5.1 Test Backend Health

Visit your Railway backend URL:
```
https://your-backend-domain.railway.app/health
```

You should see:
```json
{
  "status": "ok",
  "message": "Gather Clone Backend is running"
}
```

### 5.2 Test Frontend

Visit your Vercel frontend URL and test:
- User authentication
- Creating spaces
- Virtual environment rendering
- Multiplayer functionality

## 🔄 Step 6: Continuous Deployment

Both Railway and Vercel will automatically redeploy when you push changes to your `main` branch.

### 6.1 Update Your Code

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main
```

### 6.2 Monitor Deployments

- **Railway**: Check the "Deployments" tab in your project
- **Vercel**: Check the "Deployments" tab in your project

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Railway/Vercel
   - Verify all dependencies are in `package.json`
   - Ensure TypeScript compilation succeeds

2. **Environment Variables**
   - Verify all required variables are set
   - Check variable names match exactly
   - Ensure no extra spaces or quotes

3. **CORS Issues**
   - Verify `FRONTEND_URL` is set correctly in Railway
   - Check that the URL matches your Vercel domain exactly

4. **Database Connection**
   - Verify Supabase credentials are correct
   - Check if your Supabase project is active
   - Ensure database tables exist

### Getting Help

- **Railway**: Check [Railway Docs](https://docs.railway.app)
- **Vercel**: Check [Vercel Docs](https://vercel.com/docs)
- **GitHub Issues**: Create an issue in your repository

## 🎉 Success!

Once deployed, your Gather Clone will be available at:
- **Frontend**: `https://your-project-name.vercel.app`
- **Backend**: `https://your-project-name.railway.app`

Your application will automatically update whenever you push changes to GitHub!

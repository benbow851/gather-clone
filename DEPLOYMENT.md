# 🚀 Deployment Guide for Gather Clone

This guide will help you deploy your Gather clone to a public server.

## 📋 Prerequisites

- ✅ Supabase project configured
- ✅ Agora project configured  
- ✅ All environment variables ready
- ✅ GitHub repository (recommended)

## 🎯 Option 1: Vercel Deployment (Recommended)

### Step 1: Prepare Your Repository
1. Push your code to GitHub
2. Ensure all environment variables are documented

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables in Vercel dashboard

### Step 3: Set Environment Variables in Vercel
Go to your project settings → Environment Variables and add:

```
FRONTEND_URL=https://your-domain.vercel.app
SUPABASE_URL=https://nhqnheaucrcuacofqukg.supabase.co
SERVICE_ROLE=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=https://nhqnheaucrcuacofqukg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_BACKEND_URL=https://your-domain.vercel.app/api
NEXT_PUBLIC_AGORA_APP_ID=40ec6557a2fa4401bf71b66fdf945d6a
APP_CERTIFICATE=9f60cb9728f84e2eace185e99c1cb603
```

## 🚂 Option 2: Railway Deployment

### Step 1: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository

### Step 2: Configure Environment Variables
In Railway dashboard, add the same environment variables as above.

## 🌐 Option 3: Render Deployment

### Step 1: Deploy to Render
1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository

### Step 2: Configure Build Settings
- **Build Command:** `cd frontend && npm install && npm run build`
- **Start Command:** `cd backend && npm start`

## 🔧 Environment Variables Reference

### Required Variables:
```
FRONTEND_URL=https://your-domain.com
SUPABASE_URL=https://nhqnheaucrcuacofqukg.supabase.co
SERVICE_ROLE=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=https://nhqnheaucrcuacofqukg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_BACKEND_URL=https://your-domain.com/api
NEXT_PUBLIC_AGORA_APP_ID=40ec6557a2fa4401bf71b66fdf945d6a
APP_CERTIFICATE=9f60cb9728f84e2eace185e99c1cb603
```

## 🎉 Post-Deployment Checklist

- [ ] Test Google OAuth signin
- [ ] Test creating a new space
- [ ] Test video chat functionality
- [ ] Test multiplayer features
- [ ] Verify all environment variables are set
- [ ] Check database connections
- [ ] Test on different devices/browsers

## 🔍 Troubleshooting

### Common Issues:
1. **CORS errors** - Ensure backend URL is correct
2. **Database connection** - Verify Supabase credentials
3. **Video chat not working** - Check Agora credentials
4. **Authentication issues** - Verify Google OAuth setup

### Debug Steps:
1. Check browser console for errors
2. Verify environment variables are set correctly
3. Test database connection
4. Check network requests in browser dev tools

## 📞 Support

If you encounter issues:
1. Check the deployment platform logs
2. Verify all environment variables
3. Test locally first
4. Check browser console for errors

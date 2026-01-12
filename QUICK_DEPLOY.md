# Quick Deployment Guide

## Fastest Way: Railway (Recommended)

### Step 1: Prepare (2 minutes)

1. **Have your MongoDB connection string ready**
   - You already have: `mongodb+srv://nagpalprakankshabvpy_db_user:qwertyuiop@cluster0.n7rle9y.mongodb.net/yogaflow?retryWrites=true&w=majority`

2. **Generate a strong JWT secret**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output (you'll need it)

### Step 2: Deploy on Railway (5 minutes)

1. **Go to**: https://railway.app
2. **Sign up** with GitHub (easiest)
3. **Click**: "New Project"
4. **Select**: "Deploy from GitHub repo"
5. **Choose**: `yogaFlowBackend` repository
6. **Railway will auto-detect** Node.js and start deployment

### Step 3: Configure Environment Variables (3 minutes)

In Railway dashboard, go to your project → **Variables** tab:

Add these variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://nagpalprakankshabvpy_db_user:qwertyuiop@cluster0.n7rle9y.mongodb.net/yogaflow?retryWrites=true&w=majority
JWT_SECRET=<paste_the_secret_from_step_1>
JWT_EXPIRE=7d
CORS_ORIGIN=*
PORT=3000
```

**Note**: For CORS_ORIGIN, use `*` initially for testing, or your frontend URL later.

### Step 4: Deploy (Automatic)

- Railway will automatically:
  - Install dependencies (`npm install`)
  - Start the server (`npm start`)
  - Provide HTTPS URL

### Step 5: Verify (1 minute)

1. **Get your URL** from Railway dashboard (looks like: `https://your-app.up.railway.app`)
2. **Test health check**: Open `https://your-app.up.railway.app/health` in browser
3. **Should see**:
   ```json
   {
     "status": "OK",
     "timestamp": "...",
     "database": "connected"
   }
   ```

✅ **Done! Your API is live!**

---

## Alternative: Render (Similar Process)

1. Go to https://render.com
2. Sign up with GitHub
3. New → Web Service
4. Connect repository: `yogaFlowBackend`
5. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add environment variables (same as Railway)
7. Deploy

---

## After Deployment

### Your API URL will be:
- Railway: `https://your-app.up.railway.app`
- Render: `https://your-app.onrender.com`

### Update Postman:
1. Change `base_url` environment variable to your live URL
2. Test all endpoints

### For Frontend:
- Use the live API URL as your backend endpoint
- Update CORS_ORIGIN to your frontend domain when ready

---

## Troubleshooting

### Database not connecting?
- Check MongoDB Atlas → Network Access → Allow all IPs (0.0.0.0/0)
- Verify connection string has correct password

### Build fails?
- Check Railway/Render logs
- Verify `package.json` has `start` script (it does)

### 500 errors?
- Check environment variables are set correctly
- Check logs in platform dashboard
- Verify MongoDB connection

---

## Quick Checklist

- [ ] MongoDB connection string ready
- [ ] JWT secret generated
- [ ] Railway/Render account created
- [ ] Repository connected
- [ ] Environment variables set
- [ ] Deployment triggered
- [ ] Health check passes
- [ ] API URL saved

**Total time: ~10-15 minutes**

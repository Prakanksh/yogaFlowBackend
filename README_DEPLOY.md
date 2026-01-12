# 🚀 Quick Start: Deploy Your Backend

## Ready to Deploy?

Your backend is **production-ready**. Follow these simple steps:

### Option 1: Railway (Easiest - Recommended) ⭐

1. **Go to**: https://railway.app
2. **Sign up** with GitHub
3. **New Project** → Deploy from GitHub
4. **Select**: `yogaFlowBackend` repository
5. **Add Environment Variables** (see below)
6. **Done!** Railway provides HTTPS URL automatically

**Time**: ~10 minutes

### Option 2: Render

1. **Go to**: https://render.com
2. **Sign up** with GitHub  
3. **New** → Web Service
4. **Connect** repository
5. **Build**: `npm install`
6. **Start**: `npm start`
7. **Add Environment Variables**
8. **Deploy**

**Time**: ~10 minutes

---

## Environment Variables Needed

Copy these to your platform's environment variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://nagpalprakankshabvpy_db_user:qwertyuiop@cluster0.n7rle9y.mongodb.net/yogaflow?retryWrites=true&w=majority
JWT_SECRET=<generate_new_secret_see_below>
JWT_EXPIRE=7d
CORS_ORIGIN=*
PORT=3000
```

### Generate JWT Secret

Run this command:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as `JWT_SECRET`.

---

## Verify Deployment

After deployment, test:

1. **Health Check**: `https://your-app-url/health`
   - Should return: `{"status":"OK","database":"connected"}`

2. **API Test**: `https://your-app-url/api/`
   - Should return: `{"message":"Yoga Flow Backend API is running"}`

---

## Full Guides

- **Quick Guide**: See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)
- **Detailed Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Checklist**: See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

## Need Help?

- Check platform logs if deployment fails
- Verify all environment variables are set
- Test MongoDB connection separately
- See DEPLOYMENT.md for troubleshooting

---

**Ready? Go deploy! 🎉**

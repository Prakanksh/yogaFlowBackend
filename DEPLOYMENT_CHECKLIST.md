# Deployment Checklist

## Pre-Deployment

- [x] All code committed to GitHub
- [x] Tests passing (`npm run test:full`)
- [x] Documentation complete
- [x] Environment variables documented

## Deployment Steps

### 1. Choose Platform
- [ ] Railway (recommended - easiest)
- [ ] Render (alternative)
- [ ] Heroku (alternative)

### 2. Account Setup
- [ ] Create account on chosen platform
- [ ] Connect GitHub account
- [ ] Authorize repository access

### 3. Create Project
- [ ] Create new project/service
- [ ] Connect `yogaFlowBackend` repository
- [ ] Platform auto-detects Node.js

### 4. Environment Variables
Set these in platform's environment variables:

- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI=<your_connection_string>`
- [ ] `JWT_SECRET=<strong_random_secret>`
- [ ] `JWT_EXPIRE=7d`
- [ ] `CORS_ORIGIN=*` (or your frontend URL)
- [ ] `PORT=3000` (usually auto-set)

### 5. Deploy
- [ ] Trigger deployment
- [ ] Wait for build to complete
- [ ] Check deployment logs for errors

### 6. Verify
- [ ] Get deployed URL from platform
- [ ] Test health endpoint: `GET /health`
- [ ] Test root endpoint: `GET /`
- [ ] Test API endpoint: `POST /api/auth/login`

### 7. Post-Deployment
- [ ] Save API URL
- [ ] Update Postman environment with live URL
- [ ] Test critical endpoints
- [ ] Monitor logs for errors
- [ ] Set up custom domain (optional)

## Environment Variables Reference

### Required Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/yogaflow?retryWrites=true&w=majority
JWT_SECRET=<32+ character random string>
JWT_EXPIRE=7d
CORS_ORIGIN=*
PORT=3000
```

### Your Current Values
- **MongoDB URI**: `mongodb+srv://nagpalprakankshabvpy_db_user:qwertyuiop@cluster0.n7rle9y.mongodb.net/yogaflow?retryWrites=true&w=majority`
- **JWT Secret**: Generate new one for production
- **CORS Origin**: Use `*` for testing, or your frontend URL

## Quick Commands

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Test Locally with Production Config
```bash
# Set env vars
export NODE_ENV=production
export MONGODB_URI=your_uri
export JWT_SECRET=your_secret
# ... etc

# Run
npm start
```

## Common Issues

### Issue: Database connection fails
**Solution**: 
- Check MongoDB Atlas Network Access allows all IPs (0.0.0.0/0)
- Verify connection string is correct
- Check username/password

### Issue: Build fails
**Solution**:
- Check platform logs
- Verify Node.js version (18+ recommended)
- Check package.json scripts exist

### Issue: 500 errors
**Solution**:
- Check all environment variables are set
- Review error logs in platform dashboard
- Verify MongoDB is accessible

### Issue: CORS errors
**Solution**:
- Set CORS_ORIGIN correctly
- Include protocol (https://)
- No trailing slash
- Use `*` for testing only

## Success Indicators

✅ Health endpoint returns 200
✅ Database shows as "connected"
✅ Login endpoint works
✅ No errors in logs
✅ API responds within reasonable time

## Next Steps After Deployment

1. **Test all endpoints** with Postman using live URL
2. **Update frontend** to use live API URL
3. **Set up monitoring** (optional)
4. **Configure custom domain** (optional)
5. **Set up backups** for database (optional)

---

**Estimated Time**: 10-15 minutes
**Difficulty**: Easy (platforms handle most setup automatically)

# Deployment Guide

## Quick Deploy Options

### Option 1: Railway (Recommended - Easiest)

1. **Sign up** at [railway.app](https://railway.app)
2. **New Project** → Deploy from GitHub
3. **Select Repository**: `yogaFlowBackend`
4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_strong_secret_key
   JWT_EXPIRE=7d
   CORS_ORIGIN=https://yourdomain.com
   PORT=3000
   ```
5. **Deploy** - Railway auto-detects Node.js and runs `npm start`
6. **Get URL** - Railway provides HTTPS URL automatically

### Option 2: Heroku

1. **Install Heroku CLI** and login
2. **Create app**: `heroku create yoga-flow-backend`
3. **Set environment variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_connection_string
   heroku config:set JWT_SECRET=your_strong_secret_key
   heroku config:set JWT_EXPIRE=7d
   heroku config:set CORS_ORIGIN=https://yourdomain.com
   ```
4. **Deploy**: `git push heroku main`

### Option 3: Render

1. **Sign up** at [render.com](https://render.com)
2. **New** → Web Service
3. **Connect GitHub** repository
4. **Settings**:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node
5. **Add Environment Variables** (same as Railway)
6. **Deploy**

## Environment Variables Checklist

Required variables for production:

```env
NODE_ENV=production
PORT=3000  # Usually auto-set by platform
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_very_strong_secret_key_min_32_chars
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-frontend-domain.com
```

### Generating Strong JWT Secret

```bash
# Option 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: OpenSSL
openssl rand -hex 32

# Option 3: Online generator
# Use: https://randomkeygen.com/
```

## Pre-Deployment Checklist

- [ ] All tests passing (`npm run test:full`)
- [ ] Environment variables configured
- [ ] MongoDB connection string verified
- [ ] JWT secret is strong and secure
- [ ] CORS origin set to production frontend URL
- [ ] Database seeded (happens automatically on startup)
- [ ] Error handling tested
- [ ] Logging verified

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create account** at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Cluster** (Free tier available)
3. **Database Access** → Create user
4. **Network Access** → Allow all IPs (or specific IPs)
5. **Connect** → Get connection string
6. **Replace** `<password>` and `<dbname>` in connection string
7. **Use** in `MONGODB_URI` environment variable

### Connection String Format

```
mongodb+srv://username:password@cluster.mongodb.net/yogaflow?retryWrites=true&w=majority
```

## Build Configuration

The project is ready for deployment:
- ✅ `package.json` has `start` script
- ✅ `package.json` has `dev` script for local development
- ✅ Dependencies are in `package.json`
- ✅ No build step required (Node.js runs directly)
- ✅ Port is configurable via `PORT` environment variable

## Health Check

After deployment, verify:

1. **Health endpoint**: `GET https://your-domain.com/health`
   ```json
   {
     "status": "OK",
     "timestamp": "2024-...",
     "database": "connected"
   }
   ```

2. **Root endpoint**: `GET https://your-domain.com/`
   ```json
   {
     "message": "Yoga Flow Backend API is running"
   }
   ```

3. **Test authentication**: `POST https://your-domain.com/api/auth/login`

## Common Issues

### Database Connection Failed
- Check MongoDB connection string
- Verify network access (IP whitelist)
- Check username/password
- Ensure database name is correct

### Port Already in Use
- Most platforms auto-set PORT
- Don't hardcode port in code
- Use `process.env.PORT`

### CORS Errors
- Check `CORS_ORIGIN` environment variable
- Include protocol (https://)
- No trailing slash
- Multiple origins: comma-separated

### Module Not Found
- Ensure `node_modules` is installed
- Check `package.json` dependencies
- Verify platform Node.js version (recommend 18+)

## Monitoring

### Recommended Tools

1. **Application Monitoring**:
   - [Sentry](https://sentry.io) - Error tracking
   - [LogRocket](https://logrocket.com) - Session replay
   - [New Relic](https://newrelic.com) - Performance monitoring

2. **Uptime Monitoring**:
   - [UptimeRobot](https://uptimerobot.com) - Free tier available
   - [Pingdom](https://www.pingdom.com)

3. **Logs**:
   - Platform logs (Railway/Heroku/Render provide logs)
   - Morgan logs HTTP requests
   - Error logs in error handler

## Scaling Considerations

- **Horizontal Scaling**: Stateless design supports multiple instances
- **Database**: Use MongoDB Atlas (scales automatically)
- **Caching**: Consider Redis for session/token caching (future)
- **CDN**: For static assets (if any added later)
- **Load Balancer**: Platform usually provides (Railway/Heroku)

## SSL/HTTPS

- **Automatic**: Railway, Heroku, Render provide HTTPS automatically
- **Custom Domain**: Follow platform's custom domain guide
- **Certificate**: Usually auto-provisioned by platform

## Backup Strategy

1. **Database Backups**:
   - MongoDB Atlas: Automatic backups (paid tier)
   - Manual: `mongodump` scheduled via cron
   
2. **Environment Variables**:
   - Store securely (password manager)
   - Document in secure location
   - Version control (use platform's env var management)

3. **Code**:
   - Git repository serves as backup
   - Tag releases for easy rollback

## Rollback Procedure

1. **Code Rollback**:
   ```bash
   git tag v1.0.0  # Tag current version
   git checkout <previous-commit>
   git push --force
   ```

2. **Platform Rollback**:
   - Railway/Heroku: Use rollback feature in dashboard
   - Render: Previous deployments available in dashboard

## Support

For deployment issues:
1. Check platform logs
2. Verify environment variables
3. Test locally with production env vars
4. Check health endpoint
5. Review error logs

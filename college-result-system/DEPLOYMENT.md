# Deployment Guide

## MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a new cluster (Free tier M0)

### 2. Configure Database Access
1. Go to Database Access
2. Add new database user
3. Set username and password
4. Grant "Read and write to any database" permission

### 3. Configure Network Access
1. Go to Network Access
2. Add IP Address
3. Allow access from anywhere (0.0.0.0/0) for development
4. For production, add specific IP addresses

### 4. Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password
5. Replace `<dbname>` with `college_results`

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/college_results?retryWrites=true&w=majority
```

## Backend Deployment (Render.com)

### 1. Prepare for Deployment
```bash
cd backend
# Ensure package.json has start script
# "start": "node src/server.js"
```

### 2. Deploy to Render
1. Go to https://render.com
2. Sign up/Login
3. Click "New +" → "Web Service"
4. Connect your Git repository
5. Configure:
   - **Name:** college-result-backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

### 3. Set Environment Variables
Add these in Render dashboard:
```
PORT=5000
NODE_ENV=production
MONGODB_URI=<your_mongodb_atlas_connection_string>
JWT_SECRET=<generate_random_secret>
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@gec-pune.edu.in
ADMIN_PASSWORD=<strong_password>
CLIENT_URL=<your_frontend_url>
```

### 4. Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Note your backend URL (e.g., https://college-result-backend.onrender.com)

### 5. Seed Database
After deployment, run seed script once:
```bash
# SSH into Render or use their shell
npm run seed
```

## Frontend Deployment (Vercel)

### 1. Prepare for Deployment
```bash
cd frontend
# Update .env for production
```

### 2. Deploy to Vercel
1. Go to https://vercel.com
2. Sign up/Login with GitHub
3. Click "Add New" → "Project"
4. Import your repository
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** frontend
   - **Build Command:** `npm run build`
   - **Output Directory:** dist

### 3. Set Environment Variables
Add in Vercel dashboard:
```
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_APP_NAME=Government Engineering College, Pune
```

### 4. Deploy
- Click "Deploy"
- Wait for build to complete
- Your site will be live at: https://your-app.vercel.app

## Alternative: Railway.app Deployment

### Backend on Railway
1. Go to https://railway.app
2. Create new project from GitHub repo
3. Add MongoDB plugin
4. Set environment variables
5. Deploy automatically

### Frontend on Netlify
1. Go to https://netlify.com
2. Drag and drop `frontend/dist` folder
3. Or connect Git repository
4. Set build command: `npm run build`
5. Set publish directory: `dist`

## Post-Deployment Checklist

- [ ] Backend server is running
- [ ] MongoDB connection is successful
- [ ] Database is seeded with initial data
- [ ] Frontend can connect to backend API
- [ ] Admin login works
- [ ] Student login works
- [ ] Public result checking works
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] SSL/HTTPS is enabled

## Production Optimizations

### Backend
1. Enable compression
2. Set up logging (Winston/Morgan)
3. Configure rate limiting
4. Set up monitoring (PM2)
5. Enable HTTPS only
6. Set secure cookie options

### Frontend
1. Optimize images
2. Enable lazy loading
3. Minimize bundle size
4. Enable caching
5. Add service worker for PWA

### Database
1. Create indexes for frequently queried fields
2. Set up backup schedule
3. Monitor performance
4. Optimize queries

## Monitoring & Maintenance

### Health Checks
- Backend: `https://your-backend-url/api/health`
- Monitor uptime with UptimeRobot or similar

### Logs
- Check Render/Vercel logs regularly
- Set up error tracking (Sentry)

### Backups
- MongoDB Atlas automatic backups
- Export important data regularly

## Troubleshooting

### CORS Issues
Ensure backend has correct CORS origin:
```javascript
cors({
  origin: 'https://your-frontend-url.vercel.app',
  credentials: true,
})
```

### API Connection Issues
- Check VITE_API_URL in frontend
- Verify backend is running
- Check network tab in browser

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist
- Check connection string format
- Ensure database user has correct permissions

## Custom Domain Setup

### Frontend (Vercel)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Backend (Render)
1. Go to Settings → Custom Domains
2. Add your domain
3. Update DNS records

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable HTTPS only
- [ ] Set secure headers (Helmet)
- [ ] Implement rate limiting
- [ ] Validate all inputs
- [ ] Sanitize user data
- [ ] Keep dependencies updated
- [ ] Monitor for vulnerabilities
- [ ] Set up firewall rules

---

**Support:** For deployment issues, check platform-specific documentation or contact support.

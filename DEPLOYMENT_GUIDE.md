# 🚀 FitZone Deployment Guide

This guide covers multiple deployment options for your FitZone fitness website with complete backend and database setup.

## 🎯 Deployment Options

### Option 1: Cloud Deployment (Recommended)
- **Frontend**: Netlify or Vercel
- **Backend**: Railway or Render
- **Database**: MongoDB Atlas (Free tier available)

### Option 2: Docker Deployment (Local/VPS)
- **All-in-one**: Docker Compose setup
- **Database**: MongoDB container
- **Backend**: Node.js container
- **Frontend**: Nginx container

### Option 3: Traditional VPS Deployment
- **Server**: Ubuntu/CentOS VPS
- **Database**: MongoDB installed
- **Backend**: PM2 process manager
- **Frontend**: Nginx web server

---

## 🌐 Option 1: Cloud Deployment (FREE)

### Step 1: Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for free account
   - Create a new cluster (M0 Sandbox - FREE)

2. **Configure Database**
   ```bash
   # Get your connection string
   mongodb+srv://username:password@cluster.mongodb.net/fitzone?retryWrites=true&w=majority
   ```

3. **Seed Database**
   ```bash
   # Update MONGODB_URI in server/.env
   npm run seed
   ```

### Step 2: Backend Deployment (Railway)

1. **Create Railway Account**
   - Go to [Railway](https://railway.app)
   - Connect your GitHub account

2. **Deploy Backend**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Deploy backend"
   git push origin main
   
   # In Railway:
   # 1. Create new project
   # 2. Connect GitHub repo
   # 3. Select 'server' folder
   # 4. Add environment variables
   ```

3. **Environment Variables for Railway**
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secure_jwt_secret
   FRONTEND_URL=https://your-frontend-domain.netlify.app
   ```

### Step 3: Frontend Deployment (Netlify)

1. **Build and Deploy**
   ```bash
   # Update .env with your backend URL
   VITE_API_URL=https://your-backend.up.railway.app/api
   
   # Deploy to Netlify
   npm run build
   # Drag and drop 'dist' folder to Netlify
   ```

2. **Or Connect GitHub**
   - Connect your GitHub repo to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

---

## 🐳 Option 2: Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- 4GB+ RAM recommended

### Quick Start
```bash
# Clone and setup
git clone your-repo
cd fitzone-website

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Database**: localhost:27017

### Management Commands
```bash
# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build -d

# View backend logs
docker-compose logs backend

# Access database
docker exec -it fitzone-mongodb mongosh
```

---

## 🖥️ Option 3: VPS Deployment

### Prerequisites
- Ubuntu 20.04+ VPS
- 2GB+ RAM
- Domain name (optional)

### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### Step 2: Deploy Application
```bash
# Clone repository
git clone your-repo
cd fitzone-website

# Install dependencies
npm install
cd server && npm install && cd ..

# Build frontend
npm run build

# Setup environment
cp server/.env.production server/.env
# Edit server/.env with your values

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Seed database
npm run seed

# Start backend with PM2
cd server
pm2 start index.js --name "fitzone-backend"
pm2 startup
pm2 save
```

### Step 3: Nginx Configuration
```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/fitzone

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend
    location / {
        root /path/to/fitzone-website/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/fitzone /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔧 Environment Variables Reference

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.com/api
VITE_OPENAI_API_KEY=your_openai_key (optional)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key (optional)
VITE_APP_NAME=FitZone
VITE_APP_VERSION=1.0.0
```

### Backend (server/.env)
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-url.com
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secure_jwt_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@fitzone.com
```

---

## 🔍 Monitoring & Maintenance

### Health Checks
```bash
# Backend health
curl https://your-backend-url.com/api/health

# Database connection
curl https://your-backend-url.com/api/programs
```

### Logs
```bash
# PM2 logs
pm2 logs fitzone-backend

# Docker logs
docker-compose logs -f backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
```

### Backup Database
```bash
# MongoDB backup
mongodump --uri="your_mongodb_uri" --out=backup/

# Restore
mongorestore --uri="your_mongodb_uri" backup/
```

---

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Update `FRONTEND_URL` in backend environment
   - Check CORS configuration in `server/index.js`

2. **Database Connection**
   - Verify MongoDB URI format
   - Check network access in MongoDB Atlas
   - Ensure IP whitelist includes your server

3. **Environment Variables**
   - Restart services after changing variables
   - Check variable names match exactly

4. **Build Failures**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

### Support Commands
```bash
# Check service status
systemctl status mongod
pm2 status
nginx -t

# Restart services
sudo systemctl restart mongod
pm2 restart fitzone-backend
sudo systemctl restart nginx

# View system resources
htop
df -h
free -m
```

---

## 🎉 Success!

Your FitZone fitness website is now deployed with:
- ✅ Frontend (React + TypeScript)
- ✅ Backend API (Node.js + Express)
- ✅ Database (MongoDB)
- ✅ Authentication system
- ✅ Shopping cart & orders
- ✅ AI health assistant
- ✅ Payment processing ready
- ✅ Email notifications ready

**Access your deployed website and start managing your fitness business!** 💪

For support, check the logs and refer to this guide. Happy deploying! 🚀
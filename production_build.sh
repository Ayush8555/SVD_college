#!/bin/bash

# Production Build & Deploy Script

echo "🚀 Starting Production Build Process..."

# 1. Install Dependencies
echo "📦 Installing Dependencies..."
npm install
cd frontend
npm install
cd ..

# 2. Build Frontend
echo "🏗️  Building Frontend..."
cd frontend
npm run build
cd ..

# 3. Verify Build
if [ -d "frontend/dist" ]; then
  echo "✅ Frontend Build Successful"
else
  echo "❌ Frontend Build Failed!"
  exit 1
fi

# 4. Start/Restart Backend with PM2
echo "🔄 Starting/Reloading Application with PM2..."
cd backend
npx pm2 start ecosystem.config.cjs --env production

echo "✨ Deployment Complete! Application running on port 5001"
npx pm2 status

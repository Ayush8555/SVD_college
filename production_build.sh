#!/bin/bash

# Production Build & Deploy Script

echo "🚀 Starting Production Build Process..."

# 1. Install Dependencies
echo "📦 Installing Dependencies..."
# Root (if any)
npm install
# Frontend
cd frontend
npm install
cd ..
# Backend (CRITICAL for Render)
cd backend
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

echo "✨ Build Complete! Ready for Render to start."

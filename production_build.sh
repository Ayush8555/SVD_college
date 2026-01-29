#!/bin/bash

# Production Build & Deploy Script

echo "🚀 Starting Production Build Process..."

# 1. Install Dependencies
echo "📦 Installing Dependencies (via Workspaces)..."
npm install


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

#!/bin/bash
# Render build script for frontend

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building frontend..."
npm run build

echo "✅ Build complete! Static files are in dist/"


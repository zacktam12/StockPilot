#!/bin/bash
# Render build script for backend

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "🗄️ Running database migrations..."
npx prisma migrate deploy

echo "✅ Build complete!"


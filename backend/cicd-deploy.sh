#!/bin/bash

# You can export this before running the script or set it manually here
# export MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/db"

echo "🐳 Rebuilding Docker container..."
docker build -t timichem:latest .

echo "🛑 Stopping old container (if exists)..."
docker stop timichem || true
docker rm timichem || true

echo "🚀 Running new container..."
docker run -d \
  --name timichem \
  -p 80:3000 \
  -e NODE_ENV=production \
  -e MONGO_URI="$MONGO_URI" \
  timichem:latest

echo "✅ Deployed successfully!"

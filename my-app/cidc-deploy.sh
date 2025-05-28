#!/bin/bash
echo "🐳 Rebuilding Docker containers..."
docker compose down
docker compose up -d --build

echo "✅ Deployment complete!"

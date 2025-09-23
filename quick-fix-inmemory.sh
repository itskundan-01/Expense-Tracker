#!/bin/bash

echo "=== Quick Fix: Using In-Memory Database ==="

# Stop existing container
docker stop expense-tracker-backend 2>/dev/null || echo "Container not running"
docker rm expense-tracker-backend 2>/dev/null || echo "Container not found"

# Pull latest code
git pull origin main

# Rebuild with no-cache
docker build --no-cache -t expense-tracker-backend:latest ./server

# Run with in-memory database (no volume mount)
docker run -d \
  --name expense-tracker-backend \
  -p 8080:8080 \
  -e DATABASE_URL="jdbc:h2:mem:expense_tracker;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE" \
  -e H2_CONSOLE_ENABLED=true \
  --restart unless-stopped \
  expense-tracker-backend:latest

echo "Waiting for startup..."
sleep 20

echo "Container status:"
docker ps | grep expense-tracker-backend

echo "Application logs:"
docker logs expense-tracker-backend --tail 30

echo "Testing health endpoint..."
curl -s http://localhost:8080/api/health || echo "Health check failed"

echo "Done! This uses in-memory database (data won't persist between restarts)"
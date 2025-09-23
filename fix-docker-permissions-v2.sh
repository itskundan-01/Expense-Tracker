#!/bin/bash

echo "=== Comprehensive Docker Fix for Expense Tracker Backend ==="

# Stop the existing container
echo "1. Stopping existing container..."
docker stop expense-tracker-backend 2>/dev/null || echo "Container not running"

# Remove the existing container
echo "2. Removing existing container..."
docker rm expense-tracker-backend 2>/dev/null || echo "Container not found"

# Clean up Docker images and volumes
echo "3. Cleaning up Docker resources..."
docker volume prune -f
docker image prune -f

# Check if there are any existing database files with wrong permissions
echo "4. Removing existing database files..."
if [ -d "/home/ubuntu/expense-tracker-data" ]; then
    echo "Found existing database directory, removing it..."
    sudo rm -rf /home/ubuntu/expense-tracker-data
fi

# Pull latest code from GitHub
echo "5. Pulling latest code..."
git pull origin main

# Create new database directory with proper permissions
echo "6. Creating new database directory with proper permissions..."
mkdir -p /home/ubuntu/expense-tracker-data
sudo chown -R $USER:$USER /home/ubuntu/expense-tracker-data
chmod -R 755 /home/ubuntu/expense-tracker-data

# Rebuild Docker image with latest code and permission fixes
echo "7. Rebuilding Docker image with latest fixes..."
docker build --no-cache -t expense-tracker-backend:latest ./server

# Run container with proper configuration
echo "8. Starting new container with correct setup..."
docker run -d \
  --name expense-tracker-backend \
  -p 8080:8080 \
  -v /home/ubuntu/expense-tracker-data:/app/data \
  -e SPRING_PROFILES_ACTIVE=prod \
  --restart unless-stopped \
  expense-tracker-backend:latest

# Wait for container to initialize
echo "9. Waiting for container to initialize (30 seconds)..."
sleep 30

# Check container status
echo "10. Checking container status..."
if docker ps | grep -q expense-tracker-backend; then
    echo "✅ Container is running!"
    docker ps | grep expense-tracker-backend
else
    echo "❌ Container is not running. Checking what went wrong..."
    docker ps -a | grep expense-tracker-backend
fi

# Check container logs
echo "11. Checking container logs..."
docker logs expense-tracker-backend --tail 50

# Test if the application is responding
echo "12. Testing application health..."
sleep 10
if curl -f http://localhost:8080/api/health 2>/dev/null; then
    echo "✅ Application is responding!"
else
    echo "⚠️ Application is not responding yet. Checking more logs..."
    docker logs expense-tracker-backend --tail 20
fi

echo ""
echo "=== Fix completed! ==="
echo "If the backend is still not working, check the logs above for any remaining issues."
echo "You can manually check logs with: docker logs expense-tracker-backend -f"
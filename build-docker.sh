#!/bin/bash

# Build script for Connections Frontend Docker image

echo "Building Connections Frontend Docker image..."

# Build the Docker image (environment-agnostic)
docker build -t connections-frontend:latest .

echo "Build complete!"
echo ""
echo "This image can now be deployed to any environment with runtime configuration:"
echo ""
echo "# Development:"
echo "docker run -p 3000:80 -e CONNECTIONS_API_HOST=localhost:8000 connections-frontend:latest"
echo ""
echo "# Staging:"
echo "docker run -p 3000:80 -e CONNECTIONS_API_HOST=api-staging.yoursite.com connections-frontend:latest"
echo ""
echo "# Production:"
echo "docker run -p 3000:80 -e CONNECTIONS_API_HOST=api.yoursite.com connections-frontend:latest"
echo ""
echo "The same image works across all environments!"
echo "Then open http://localhost:3000 in your browser"

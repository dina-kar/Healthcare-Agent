#!/bin/bash

# Healthcare Application Docker Startup Script
# This script starts all services and provides helpful output

set -e

echo "🚀 Starting Healthcare Application with Docker Compose"
echo "===================================================="

# Check if docker-compose exists, otherwise use docker compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    DOCKER_COMPOSE_CMD="docker compose"
fi

echo "📋 Using command: $DOCKER_COMPOSE_CMD"

# Start all services
echo "🔄 Starting PostgreSQL database..."
echo "🔄 Starting database seeding service..."
echo "🔄 Starting Python backend..."
echo "🔄 Starting Next.js frontend..."
echo ""

$DOCKER_COMPOSE_CMD up -d

echo ""
echo "⏳ Waiting for services to be ready..."
echo "   - PostgreSQL: http://localhost:5432"
echo "   - Backend API: http://localhost:8000"
echo "   - Frontend: http://localhost:3000"
echo ""

# Wait for services to be healthy
echo "🏥 Checking service health..."
sleep 10

# Check if services are running
if $DOCKER_COMPOSE_CMD ps | grep -q "Up"; then
    echo "✅ Services are starting up successfully!"
    echo ""
    echo "📊 Service Status:"
    $DOCKER_COMPOSE_CMD ps
    echo ""
    echo "🌐 Access your application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8000"
    echo "   Database: postgresql://user:password@localhost:5432/healthcare_db"
    echo ""
    echo "🔐 Default login credentials:"
    echo "   Email: alice@example.com"
    echo "   Password: Demo1234!"
    echo ""
    echo "📖 For more information, see README.md"
else
    echo "❌ Some services failed to start. Check logs with:"
    echo "   $DOCKER_COMPOSE_CMD logs"
    exit 1
fi

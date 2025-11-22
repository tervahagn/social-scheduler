#!/bin/bash

# Social Scheduler - Startup Script
# Starts both backend and frontend servers

echo "🚀 Starting Social Scheduler..."

# Check if running from project root
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Kill any existing processes on ports 3000/3001
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Start backend
echo "⚙️  Starting backend (localhost:3001)..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Start frontend
echo "🎨 Starting frontend (localhost:3000)..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

# Wait a bit then open browser
sleep 3
echo "🌐 Opening browser..."
open http://localhost:3000

echo ""
echo "✅ Social Scheduler is running!"
echo "   Backend:  http://localhost:3001"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID

#!/bin/bash

# Social Scheduler - Startup Script
# Starts both backend and frontend servers with automatic setup

# Colors for better UX
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print colored output
print_info() { echo -e "${CYAN}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_step() { echo -e "${BLUE}🔹 $1${NC}"; }

# Cleanup function
cleanup() {
    echo ""
    print_info "Shutting down..."
    
    # Kill backend and frontend processes
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    # Kill processes on ports 3000 and 3001
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    
    print_success "Stopped all servers"
    exit 0
}

# Set up trap for Ctrl+C
trap cleanup SIGINT SIGTERM

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}    🚀 Social Scheduler - Quick Start${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if running from project root
print_step "Checking project structure..."
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Run this script from the project root directory"
    exit 1
fi
print_success "Project structure verified"

# Check for Node.js
print_step "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js $NODE_VERSION found"

# Check backend dependencies
print_step "Checking backend dependencies..."
if [ ! -d "backend/node_modules" ]; then
    print_warning "Backend dependencies not found. Installing..."
    cd backend
    npm install
    cd ..
    print_success "Backend dependencies installed"
else
    print_success "Backend dependencies found"
fi

# Check frontend dependencies
print_step "Checking frontend dependencies..."
if [ ! -d "frontend/node_modules" ]; then
    print_warning "Frontend dependencies not found. Installing..."
    cd frontend
    npm install
    cd ..
    print_success "Frontend dependencies installed"
else
    print_success "Frontend dependencies found"
fi

# Check for .env file
print_step "Checking environment configuration..."
if [ ! -f "backend/.env" ]; then
    print_warning ".env file not found in backend directory"
    if [ -f ".env.example" ]; then
        print_info "Creating .env from .env.example..."
        cp .env.example backend/.env
        print_warning "Please configure backend/.env with your OPENROUTER_API_KEY"
        print_info "Get your API key at: https://openrouter.ai/"
        echo ""
        read -p "Press Enter after configuring .env, or Ctrl+C to exit..."
    else
        print_error "No .env.example found. Please create backend/.env manually"
        exit 1
    fi
fi
print_success "Environment configuration found"

# Check database initialization
print_step "Checking database..."
if [ ! -f "backend/database.sqlite" ]; then
    print_warning "Database not found. Initializing..."
    cd backend
    npm run init-db
    cd ..
    print_success "Database initialized"
else
    print_success "Database found"
fi

# Kill any existing processes on ports 3000/3001
print_step "Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null
print_success "Ports cleaned up"

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}    🎬 Starting Servers${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Start backend
print_info "Starting backend (localhost:3001)..."
(cd backend && npm run dev > /tmp/social-scheduler-backend.log 2>&1) &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    print_error "Backend failed to start. Check logs at /tmp/social-scheduler-backend.log"
    exit 1
fi
print_success "Backend started successfully"

# Start frontend
print_info "Starting frontend (localhost:3000)..."
(cd frontend && npm run dev > /tmp/social-scheduler-frontend.log 2>&1) &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 3

# Check if frontend is running
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    print_error "Frontend failed to start. Check logs at /tmp/social-scheduler-frontend.log"
    cleanup
    exit 1
fi
print_success "Frontend started successfully"

# Wait a bit more then open browser
sleep 1
print_info "Opening browser..."
open http://localhost:3000 2>/dev/null || {
    print_warning "Could not open browser automatically"
}

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}    ✨ Social Scheduler is running!${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${CYAN}Frontend:${NC}  http://localhost:3000"
echo -e "  ${CYAN}Backend:${NC}   http://localhost:3001"
echo ""
echo -e "  ${YELLOW}Logs:${NC}"
echo -e "    Backend:  /tmp/social-scheduler-backend.log"
echo -e "    Frontend: /tmp/social-scheduler-frontend.log"
echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
print_warning "Press Ctrl+C to stop both servers"
echo ""

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID

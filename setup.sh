#!/bin/bash

# Colbin User Management System Setup Script
echo "🚀 Setting up Colbin User Management System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js (v16 or higher) first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="16.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    print_error "Node.js version $NODE_VERSION is not supported. Please install Node.js v16 or higher."
    exit 1
fi

print_status "Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "npm $(npm -v) detected"

# Setup Backend
echo ""
echo "🔧 Setting up Backend..."
cd backend

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    cp env.example .env
    print_status "Created backend/.env file"
    print_warning "Please update JWT secrets in backend/.env before running in production!"
else
    print_info "backend/.env already exists"
fi

# Install backend dependencies
print_info "Installing backend dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_status "Backend dependencies installed successfully"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Setup Frontend
echo ""
echo "🎨 Setting up Frontend..."
cd ../frontend

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    cp env.example .env
    print_status "Created frontend/.env file"
else
    print_info "frontend/.env already exists"
fi

# Install frontend dependencies
print_info "Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_status "Frontend dependencies installed successfully"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Install Tailwind CSS
print_info "Installing Tailwind CSS..."
npm install -D tailwindcss postcss autoprefixer

if [ $? -eq 0 ]; then
    print_status "Tailwind CSS installed successfully"
else
    print_error "Failed to install Tailwind CSS"
    exit 1
fi

# Go back to root directory
cd ..

# Create start scripts
echo ""
echo "📝 Creating start scripts..."

# Create start-backend.sh
cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Colbin Backend Server..."
cd backend
npm run dev
EOF

# Create start-frontend.sh
cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "🎨 Starting Colbin Frontend Server..."
cd frontend
npm start
EOF

# Create start-all.sh
cat > start-all.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Colbin Full-Stack Application..."

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend in background
echo "🔧 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "🎨 Starting frontend server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Servers started successfully!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:3001"
echo "📚 API Health: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID
EOF

# Make scripts executable
chmod +x start-backend.sh start-frontend.sh start-all.sh

print_status "Created start scripts (start-backend.sh, start-frontend.sh, start-all.sh)"

# Setup completion
echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Quick Start Guide:"
echo "1. Start both servers: ./start-all.sh"
echo "2. Or start individually:"
echo "   - Backend only: ./start-backend.sh"
echo "   - Frontend only: ./start-frontend.sh"
echo ""
echo "🌐 Application URLs:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:3001"
echo "   - API Documentation: See docs/API_DOCS.md"
echo ""
echo "⚠️  Important Notes:"
echo "   - Update JWT secrets in backend/.env before production use"
echo "   - The SQLite database will be created automatically on first run"
echo "   - Check README.md for detailed documentation"
echo ""
echo "🚀 Ready to go! Run './start-all.sh' to start the application."

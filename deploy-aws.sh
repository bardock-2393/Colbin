#!/bin/bash

# AWS Deployment Script for Colbin Application
# Server IP: 13.204.21.149

echo "🚀 Starting AWS deployment for Colbin..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're on the server
if [[ $(hostname -I | grep -c "172.31") -eq 0 ]]; then
    print_error "This script should be run on the AWS server (13.204.21.149)"
    exit 1
fi

# Set up environment variables
print_status "Setting up environment variables..."

# Backend environment
cd /home/ubuntu/Colbin/backend
cp env.example .env

# Generate strong JWT secrets
JWT_ACCESS_SECRET=$(openssl rand -hex 64)
JWT_REFRESH_SECRET=$(openssl rand -hex 64)

# Update .env file
cat > .env << EOF
# Server Configuration
PORT=3001
NODE_ENV=production

# JWT Configuration
JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Database Configuration
DB_PATH=./database/users.db

# CORS Configuration
FRONTEND_URL=http://13.204.21.149:3000
CORS_ORIGIN=http://13.204.21.149:3000,http://13.204.21.149
EOF

print_success "Backend environment configured"

# Frontend environment
cd /home/ubuntu/Colbin/frontend
cp env.example .env

cat > .env << EOF
REACT_APP_API_URL=http://13.204.21.149:3001/api
GENERATE_SOURCEMAP=false
PUBLIC_URL=http://13.204.21.149:3000
EOF

print_success "Frontend environment configured"

# Install dependencies
print_status "Installing dependencies..."

cd /home/ubuntu/Colbin/backend
npm install

cd /home/ubuntu/Colbin/frontend
npm install

# Build frontend
print_status "Building frontend..."
npm run build

# Create PM2 ecosystem file
print_status "Creating PM2 configuration..."
cd /home/ubuntu/Colbin

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'colbin-backend',
      script: './backend/server.js',
      cwd: '/home/ubuntu/Colbin',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'colbin-frontend',
      script: 'serve',
      args: '-s build -l 3000 -L',
      cwd: '/home/ubuntu/Colbin/frontend',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};
EOF

# Create logs directory
mkdir -p logs

# Stop existing PM2 processes
print_status "Stopping existing processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Start applications
print_status "Starting applications with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
print_status "Setting up PM2 startup..."
pm2 startup ubuntu -u ubuntu --hp /home/ubuntu

# Configure firewall
print_status "Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw --force enable

# Test applications
print_status "Testing applications..."
sleep 5

# Check backend
if curl -s http://localhost:3001/health > /dev/null; then
    print_success "Backend is running ✅"
else
    print_error "Backend is not responding ❌"
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null; then
    print_success "Frontend is running ✅"
else
    print_error "Frontend is not responding ❌"
fi

# Display status
print_status "Application Status:"
pm2 status

print_success "🎉 Deployment completed!"
print_status "Your applications are now available at:"
echo "  Frontend: http://13.204.21.149:3000"
echo "  Backend:  http://13.204.21.149:3001"
echo "  Health:   http://13.204.21.149:3001/health"

print_status "To monitor your applications:"
echo "  pm2 status"
echo "  pm2 logs"
echo "  pm2 monit"

print_warning "Important: Make sure your AWS Security Group allows inbound traffic on ports 3000 and 3001"

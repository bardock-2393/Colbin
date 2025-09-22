#!/bin/bash

# Server Setup Script for AWS EC2 Ubuntu
# Run this first on your server: 13.204.21.149

echo "🛠️  Setting up AWS server for Colbin deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 LTS
print_status "Installing Node.js 18 LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
print_status "Installing PM2 process manager..."
sudo npm install -g pm2

# Install serve (for serving React build)
print_status "Installing serve..."
sudo npm install -g serve

# Install Git
print_status "Installing Git..."
sudo apt install git -y

# Install Nginx (optional)
print_status "Installing Nginx..."
sudo apt install nginx -y

# Install SSL tools (optional)
print_status "Installing SSL tools..."
sudo apt install certbot python3-certbot-nginx -y

# Install system monitoring tools
print_status "Installing system tools..."
sudo apt install htop curl wget unzip -y

# Create application directory
print_status "Creating application directory..."
mkdir -p /home/ubuntu/logs

# Set proper permissions
sudo chown -R ubuntu:ubuntu /home/ubuntu

# Configure firewall
print_status "Configuring UFW firewall..."
sudo ufw allow ssh
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw --force enable

print_success "✅ Server setup completed!"

# Display versions
print_status "Installed versions:"
echo "  Node.js: $(node --version)"
echo "  NPM: $(npm --version)"
echo "  PM2: $(pm2 --version)"
echo "  Git: $(git --version)"

print_status "Next steps:"
echo "1. Clone your repository: git clone <your-repo-url> Colbin"
echo "2. Run the deployment script: chmod +x deploy-aws.sh && ./deploy-aws.sh"
echo "3. Configure AWS Security Group to allow ports 3000 and 3001"

print_success "🚀 Ready for deployment!"

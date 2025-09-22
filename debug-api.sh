#!/bin/bash

# Debug API Connection Script
# Run this on your server to troubleshoot API issues

echo "🔍 Debugging API Connection Issues..."

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if applications are running
print_status "Checking running processes..."
pm2 status

# Check listening ports
print_status "Checking listening ports..."
sudo netstat -tlnp | grep -E ":(3000|3001)"

# Test backend locally
print_status "Testing backend health endpoint..."
if curl -s http://localhost:3001/health > /dev/null; then
    print_success "✅ Backend health check: OK"
    curl -s http://localhost:3001/health | jq '.' 2>/dev/null || curl -s http://localhost:3001/health
else
    print_error "❌ Backend health check: FAILED"
fi

# Test backend externally
print_status "Testing backend externally..."
if curl -s http://13.204.21.149:3001/health > /dev/null; then
    print_success "✅ External backend access: OK"
else
    print_error "❌ External backend access: FAILED"
fi

# Test frontend locally
print_status "Testing frontend locally..."
if curl -s http://localhost:3000 > /dev/null; then
    print_success "✅ Frontend local access: OK"
else
    print_error "❌ Frontend local access: FAILED"
fi

# Test frontend externally
print_status "Testing frontend externally..."
if curl -s http://13.204.21.149:3000 > /dev/null; then
    print_success "✅ External frontend access: OK"
else
    print_error "❌ External frontend access: FAILED"
fi

# Check firewall status
print_status "Checking firewall status..."
sudo ufw status

# Check environment variables
print_status "Checking environment variables..."
echo "Backend environment (without secrets):"
if [ -f "/home/ubuntu/Colbin/backend/.env" ]; then
    cat /home/ubuntu/Colbin/backend/.env | grep -v SECRET
else
    print_error "Backend .env file not found!"
fi

echo ""
echo "Frontend environment:"
if [ -f "/home/ubuntu/Colbin/frontend/.env" ]; then
    cat /home/ubuntu/Colbin/frontend/.env
else
    print_error "Frontend .env file not found!"
fi

# Check logs
print_status "Recent application logs..."
echo "Backend logs (last 10 lines):"
pm2 logs colbin-backend --lines 10 --nostream

echo ""
echo "Frontend logs (last 10 lines):"
pm2 logs colbin-frontend --lines 10 --nostream

# Test API endpoints
print_status "Testing API endpoints..."

echo "Testing registration endpoint:"
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123","name":"Test User"}' \
  -w "\nHTTP Status: %{http_code}\n" 2>/dev/null

echo ""
echo "Testing CORS preflight:"
curl -X OPTIONS http://localhost:3001/api/auth/register \
  -H "Origin: http://13.204.21.149:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -w "\nHTTP Status: %{http_code}\n" 2>/dev/null

# System resources
print_status "System resources..."
echo "Memory usage:"
free -h

echo ""
echo "Disk usage:"
df -h

echo ""
echo "CPU usage:"
top -bn1 | grep "Cpu(s)"

print_status "🔍 Debug complete! Check the output above for any issues."

echo ""
print_warning "Common fixes:"
echo "1. If backend is not accessible externally, check AWS Security Groups"
echo "2. If CORS errors, verify FRONTEND_URL in backend .env"
echo "3. If 400 errors, check request data format"
echo "4. If connection refused, ensure applications are running on correct ports"
echo "5. Restart applications: pm2 restart all"

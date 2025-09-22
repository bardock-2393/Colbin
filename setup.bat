@echo off
setlocal EnableDelayedExpansion

:: Colbin User Management System Setup Script for Windows
echo 🚀 Setting up Colbin User Management System...

:: Check if Node.js is installed
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js v16 or higher first.
    pause
    exit /b 1
)

echo ✅ Node.js detected: 
node -v

:: Check if npm is installed
npm -v >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm detected:
npm -v

:: Setup Backend
echo.
echo 🔧 Setting up Backend...
cd backend

:: Copy environment file if it doesn't exist
if not exist .env (
    copy env.example .env >nul
    echo ✅ Created backend\.env file
    echo ⚠️  Please update JWT secrets in backend\.env before running in production!
) else (
    echo ℹ️  backend\.env already exists
)

:: Install backend dependencies
echo ℹ️  Installing backend dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed successfully

:: Setup Frontend
echo.
echo 🎨 Setting up Frontend...
cd ..\frontend

:: Copy environment file if it doesn't exist
if not exist .env (
    copy env.example .env >nul
    echo ✅ Created frontend\.env file
) else (
    echo ℹ️  frontend\.env already exists
)

:: Install frontend dependencies
echo ℹ️  Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed successfully

:: Install Tailwind CSS
echo ℹ️  Installing Tailwind CSS...
call npm install -D tailwindcss postcss autoprefixer
if errorlevel 1 (
    echo ❌ Failed to install Tailwind CSS
    pause
    exit /b 1
)
echo ✅ Tailwind CSS installed successfully

:: Go back to root directory
cd ..

:: Create start scripts
echo.
echo 📝 Creating start scripts...

:: Create start-backend.bat
echo @echo off > start-backend.bat
echo echo 🚀 Starting Colbin Backend Server... >> start-backend.bat
echo cd backend >> start-backend.bat
echo npm run dev >> start-backend.bat
echo pause >> start-backend.bat

:: Create start-frontend.bat
echo @echo off > start-frontend.bat
echo echo 🎨 Starting Colbin Frontend Server... >> start-frontend.bat
echo cd frontend >> start-frontend.bat
echo npm start >> start-frontend.bat
echo pause >> start-frontend.bat

:: Create start-all.bat
echo @echo off > start-all.bat
echo echo 🚀 Starting Colbin Full-Stack Application... >> start-all.bat
echo echo. >> start-all.bat
echo echo 🔧 Starting backend server in new window... >> start-all.bat
echo start "Colbin Backend" cmd /k "cd backend && npm run dev" >> start-all.bat
echo echo. >> start-all.bat
echo echo 🎨 Starting frontend server in new window... >> start-all.bat
echo start "Colbin Frontend" cmd /k "cd frontend && npm start" >> start-all.bat
echo echo. >> start-all.bat
echo echo ✅ Servers started successfully! >> start-all.bat
echo echo 🌐 Frontend: http://localhost:3000 >> start-all.bat
echo echo 🔗 Backend API: http://localhost:3001 >> start-all.bat
echo echo 📚 API Health: http://localhost:3001/health >> start-all.bat
echo echo. >> start-all.bat
echo echo Close the server windows to stop the application. >> start-all.bat
echo pause >> start-all.bat

echo ✅ Created start scripts (start-backend.bat, start-frontend.bat, start-all.bat)

:: Setup completion
echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Quick Start Guide:
echo 1. Start both servers: start-all.bat
echo 2. Or start individually:
echo    - Backend only: start-backend.bat
echo    - Frontend only: start-frontend.bat
echo.
echo 🌐 Application URLs:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:3001
echo    - API Documentation: See docs\API_DOCS.md
echo.
echo ⚠️  Important Notes:
echo    - Update JWT secrets in backend\.env before production use
echo    - The SQLite database will be created automatically on first run
echo    - Check README.md for detailed documentation
echo.
echo 🚀 Ready to go! Run 'start-all.bat' to start the application.
echo.
pause

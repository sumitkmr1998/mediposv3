@echo off
echo ========================================
echo   MediPOS Frontend Application Startup
echo ========================================
echo.

cd /d "%~dp0frontend"

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)

echo Checking frontend dependencies...
if not exist "package.json" (
    echo ERROR: package.json not found
    echo Make sure you're in the correct directory
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing frontend dependencies...
    echo This may take a few minutes...
    yarn install
    if errorlevel 1 (
        echo Yarn failed, trying npm...
        npm install
    )
)

echo Starting MediPOS Frontend...
echo Application will be available at:
echo - Local: http://localhost:3000
echo - Network: http://YOUR_IP:3000 (replace YOUR_IP with your actual IP address)
echo.
echo Default Login: admin / admin123
echo.

yarn start
if errorlevel 1 (
    echo Yarn failed, trying npm...
    npm start
)

if errorlevel 1 (
    echo.
    echo ERROR: Frontend server failed to start
    echo Common solutions:
    echo 1. Check if port 3000 is already in use
    echo 2. Verify all dependencies are installed: yarn install
    echo 3. Check if .env file exists with correct configuration
)

echo.
echo Press any key to close...
pause >nul
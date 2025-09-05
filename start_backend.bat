@echo off
echo ========================================
echo    MediPOS Backend Server Startup
echo ========================================
echo.

cd /d "%~dp0backend"

echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo Checking backend dependencies...
if not exist "requirements.txt" (
    echo ERROR: requirements.txt not found
    echo Make sure you're in the correct directory
    pause
    exit /b 1
)

echo Starting MediPOS Backend Server...
echo Backend API will be available at: http://localhost:8001
echo API Documentation: http://localhost:8001/docs
echo.
python server.py

if errorlevel 1 (
    echo.
    echo ERROR: Backend server failed to start
    echo Common solutions:
    echo 1. Check if MongoDB is running: net start MongoDB
    echo 2. Check if port 8001 is already in use
    echo 3. Verify all dependencies are installed: pip install -r requirements.txt
)

echo.
echo Press any key to close...
pause >nul
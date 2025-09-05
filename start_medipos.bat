@echo off
echo ========================================
echo      MediPOS Complete Application
echo    Pharmacy Management System Startup
echo ========================================
echo.

echo Checking system requirements...

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed
    echo Please install Python 3.8+ from https://python.org/downloads/
    pause
    exit /b 1
)

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Check MongoDB
echo Checking MongoDB service...
sc query MongoDB >nul 2>&1
if errorlevel 1 (
    echo WARNING: MongoDB service not found
    echo Attempting to start MongoDB manually...
    net start MongoDB >nul 2>&1
    if errorlevel 1 (
        echo MongoDB not running. Please start MongoDB manually or install it.
        echo Download from: https://www.mongodb.com/try/download/community
    )
) else (
    echo MongoDB service found, ensuring it's running...
    net start MongoDB >nul 2>&1
)

echo.
echo Starting MediPOS Application...
echo.

REM Get local IP address
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=1 delims= " %%j in ("%%i") do (
        set LOCAL_IP=%%j
        goto :found_ip
    )
)
:found_ip

echo System Information:
echo - Your IP Address: %LOCAL_IP%
echo - Backend API: http://%LOCAL_IP%:8001
echo - Frontend App: http://%LOCAL_IP%:3000
echo.

echo IMPORTANT: Update your .env files with the correct IP address:
echo 1. Edit backend\.env - Update CORS_ORIGINS with your IP
echo 2. Edit frontend\.env - Update REACT_APP_BACKEND_URL with your IP
echo.

echo Starting Backend Server...
start "MediPOS Backend" cmd /c "call start_backend.bat"

echo Waiting for backend to initialize...
timeout /t 8 /nobreak >nul

echo Starting Frontend Application...
start "MediPOS Frontend" cmd /c "call start_frontend.bat"

echo.
echo ========================================
echo     MediPOS is Starting Up...
echo ========================================
echo.
echo Access URLs:
echo - Local Computer: http://localhost:3000
echo - Other Devices: http://%LOCAL_IP%:3000
echo - API Documentation: http://%LOCAL_IP%:8001/docs
echo.
echo Default Login Credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo SECURITY: Please change the default password after first login!
echo.
echo Windows Firewall: If you can't access from other devices,
echo you may need to allow ports 3000 and 8001 through Windows Firewall.
echo.
echo Press any key to open the application in your browser...
pause >nul

REM Open application in default browser
start http://localhost:3000

echo.
echo MediPOS application opened in your browser.
echo Both backend and frontend are running in separate windows.
echo Close those windows to stop the services.
echo.
pause
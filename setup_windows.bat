@echo off
echo ========================================
echo    MediPOS Windows Setup Assistant
echo ========================================
echo.

echo This script will help you set up MediPOS on Windows
echo.

REM Check if running as admin
net session >nul 2>&1
if errorlevel 1 (
    echo NOTE: For firewall configuration, run this script as Administrator
    echo Right-click and select "Run as administrator"
    echo.
)

echo Step 1: Detecting your network IP address...
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=1 delims= " %%j in ("%%i") do (
        set LOCAL_IP=%%j
        echo Found IP Address: %%j
        goto :found_ip
    )
)
:found_ip

if "%LOCAL_IP%"=="" (
    echo ERROR: Could not detect IP address
    echo Please run: ipconfig
    echo And look for your IPv4 Address
    pause
    exit /b 1
)

echo.
echo Step 2: Updating configuration files...

REM Update backend .env
echo Updating backend configuration...
if exist "backend\.env" (
    (
        echo MONGO_URL=mongodb://localhost:27017
        echo DB_NAME=medipos_db
        echo SECRET_KEY=your-secret-key-change-this-in-production-medipos-2024
        echo HOST=0.0.0.0
        echo PORT=8001
        echo CORS_ORIGINS=http://localhost:3000,http://%LOCAL_IP%:3000,http://127.0.0.1:3000
    ) > "backend\.env"
    echo ✅ Backend configuration updated
) else (
    echo ❌ Backend .env file not found
)

REM Update frontend .env
echo Updating frontend configuration...
if exist "frontend\.env" (
    (
        echo REACT_APP_BACKEND_URL=http://%LOCAL_IP%:8001
        echo PORT=3000
        echo HOST=0.0.0.0
    ) > "frontend\.env"
    echo ✅ Frontend configuration updated
) else (
    echo ❌ Frontend .env file not found
)

echo.
echo Step 3: Installing dependencies...

echo Installing backend dependencies...
if exist "backend\requirements.txt" (
    cd backend
    pip install -r requirements.txt
    cd ..
    echo ✅ Backend dependencies installed
) else (
    echo ❌ Backend requirements.txt not found
)

echo Installing frontend dependencies...
if exist "frontend\package.json" (
    cd frontend
    
    REM Try yarn first, fallback to npm
    yarn --version >nul 2>&1
    if errorlevel 1 (
        echo Yarn not found, using npm...
        npm install
    ) else (
        echo Using yarn...
        yarn install
    )
    
    cd ..
    echo ✅ Frontend dependencies installed
) else (
    echo ❌ Frontend package.json not found
)

echo.
echo Step 4: Configuring Windows Firewall...

REM Check if running as admin for firewall rules
net session >nul 2>&1
if errorlevel 1 (
    echo WARNING: Not running as administrator
    echo Cannot configure firewall automatically
    echo Please manually allow ports 3000 and 8001 through Windows Firewall
) else (
    echo Adding firewall rules...
    netsh advfirewall firewall add rule name="MediPOS Backend" dir=in action=allow protocol=TCP localport=8001 >nul 2>&1
    netsh advfirewall firewall add rule name="MediPOS Frontend" dir=in action=allow protocol=TCP localport=3000 >nul 2>&1
    echo ✅ Firewall rules added
)

echo.
echo ========================================
echo         Setup Complete!
echo ========================================
echo.
echo Your MediPOS configuration:
echo - Server IP: %LOCAL_IP%
echo - Frontend: http://%LOCAL_IP%:3000
echo - Backend API: http://%LOCAL_IP%:8001
echo.
echo Next steps:
echo 1. Ensure MongoDB is installed and running
echo 2. Run start_medipos.bat to start the application
echo 3. Access from any device: http://%LOCAL_IP%:3000
echo 4. Login with: admin / admin123
echo.
echo Files created:
echo - start_medipos.bat (starts both backend and frontend)
echo - start_backend.bat (starts backend only)
echo - start_frontend.bat (starts frontend only)
echo.
pause
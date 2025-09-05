@echo off
echo ========================================
echo    MediPOS System Requirements Check
echo ========================================
echo.

set "ERRORS=0"

echo Checking system requirements...
echo.

REM Check Python
echo [1/5] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is NOT installed
    echo Download from: https://python.org/downloads/
    echo Minimum version: Python 3.8
    set /a ERRORS+=1
) else (
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VER=%%i
    echo ✅ Python %PYTHON_VER% is installed
)

REM Check Node.js
echo [2/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is NOT installed
    echo Download from: https://nodejs.org/
    echo Minimum version: Node.js 16
    set /a ERRORS+=1
) else (
    for /f %%i in ('node --version') do set NODE_VER=%%i
    echo ✅ Node.js %NODE_VER% is installed
)

REM Check MongoDB
echo [3/5] Checking MongoDB installation...
sc query MongoDB >nul 2>&1
if errorlevel 1 (
    echo ❌ MongoDB service is NOT found
    echo Download from: https://www.mongodb.com/try/download/community
    set /a ERRORS+=1
) else (
    sc query MongoDB | find "RUNNING" >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  MongoDB is installed but NOT running
        echo Starting MongoDB service...
        net start MongoDB >nul 2>&1
        if errorlevel 1 (
            echo ❌ Failed to start MongoDB
            set /a ERRORS+=1
        ) else (
            echo ✅ MongoDB is now running
        )
    ) else (
        echo ✅ MongoDB is installed and running
    )
)

REM Check network connectivity
echo [4/5] Checking network configuration...
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=1 delims= " %%j in ("%%i") do (
        set LOCAL_IP=%%j
        echo ✅ Network IP detected: %%j
        goto :ip_found
    )
)
echo ❌ Could not detect network IP address
set /a ERRORS+=1
:ip_found

REM Check if required files exist
echo [5/5] Checking MediPOS files...
if not exist "backend\server.py" (
    echo ❌ Backend server.py not found
    set /a ERRORS+=1
) else (
    echo ✅ Backend files found
)

if not exist "frontend\package.json" (
    echo ❌ Frontend package.json not found
    set /a ERRORS+=1
) else (
    echo ✅ Frontend files found
)

if not exist "backend\.env" (
    echo ⚠️  Backend .env file not found - will be created during setup
) else (
    echo ✅ Backend configuration found
)

if not exist "frontend\.env" (
    echo ⚠️  Frontend .env file not found - will be created during setup  
) else (
    echo ✅ Frontend configuration found
)

echo.
echo ========================================
echo           System Check Results
echo ========================================

if %ERRORS% == 0 (
    echo ✅ All requirements met! Your system is ready for MediPOS.
    echo.
    echo Next steps:
    echo 1. Run setup_windows.bat to configure the application
    echo 2. Run start_medipos.bat to start the services
    echo 3. Access http://%LOCAL_IP%:3000 from any device
) else (
    echo ❌ Found %ERRORS% issue(s) that need to be resolved.
    echo.
    echo Please install missing requirements and run this check again.
)

echo.
echo Detailed system information:
echo - OS: %OS%
echo - Computer: %COMPUTERNAME%
echo - User: %USERNAME%
echo - Network IP: %LOCAL_IP%
echo.

echo Press any key to continue...
pause >nul
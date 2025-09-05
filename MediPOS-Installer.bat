@echo off
title MediPOS Pharmacy Management System - Installer
setlocal enabledelayedexpansion

REM ============================================================================
REM MediPOS Complete Installation and Setup Script
REM This script will install all dependencies and configure the system
REM ============================================================================

set "INSTALL_DIR=%~dp0"
set "MEDIPOS_DIR=%INSTALL_DIR%MediPOS"
set "LOG_FILE=%INSTALL_DIR%installation.log"

echo ============================================================ >> "%LOG_FILE%"
echo MediPOS Installation Started: %DATE% %TIME% >> "%LOG_FILE%"
echo ============================================================ >> "%LOG_FILE%"

cls
echo ================================================================
echo               MediPOS Pharmacy Management System
echo                     Installation Wizard
echo ================================================================
echo.
echo This installer will:
echo  1. Check system requirements
echo  2. Install Python and Node.js (if needed)
echo  3. Set up MediPOS application
echo  4. Configure portable MongoDB
echo  5. Create desktop shortcuts
echo.
echo Installation will take approximately 10-15 minutes.
echo.
pause

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This installer requires administrator privileges.
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

REM Create installation directory
if not exist "%MEDIPOS_DIR%" mkdir "%MEDIPOS_DIR%"

REM Step 1: System Requirements Check
echo.
echo [1/6] Checking system requirements...
echo [1/6] Checking system requirements... >> "%LOG_FILE%"

REM Check Windows version
for /f "tokens=4-7 delims=. " %%i in ('ver') do set VERSION=%%i.%%j
echo Windows version: %VERSION% >> "%LOG_FILE%"

REM Check available disk space (require at least 2GB)
for /f "tokens=3" %%a in ('dir /-c "%SystemDrive%\" ^| find "bytes free"') do set FREE_SPACE=%%a
if %FREE_SPACE% LSS 2000000000 (
    echo ERROR: Insufficient disk space. At least 2GB required.
    echo ERROR: Insufficient disk space >> "%LOG_FILE%"
    pause
    exit /b 1
)

echo System requirements check passed.
echo System requirements check passed. >> "%LOG_FILE%"

REM Step 2: Download and Install Dependencies
echo.
echo [2/6] Installing dependencies...
echo [2/6] Installing dependencies... >> "%LOG_FILE%"

REM Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Python 3.11...
    echo Installing Python 3.11... >> "%LOG_FILE%"
    
    REM Download Python installer
    powershell -Command "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.8/python-3.11.8-amd64.exe' -OutFile '%INSTALL_DIR%python-installer.exe'"
    
    REM Install Python silently
    "%INSTALL_DIR%python-installer.exe" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
    
    REM Wait for installation
    timeout /t 30 /nobreak > nul
    
    REM Refresh PATH
    call refreshenv.cmd
    
    del "%INSTALL_DIR%python-installer.exe"
) else (
    echo Python already installed.
    echo Python already installed. >> "%LOG_FILE%"
)

REM Check for Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Node.js...
    echo Installing Node.js... >> "%LOG_FILE%"
    
    REM Download Node.js installer
    powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile '%INSTALL_DIR%nodejs-installer.msi'"
    
    REM Install Node.js silently
    msiexec /i "%INSTALL_DIR%nodejs-installer.msi" /quiet
    
    REM Wait for installation
    timeout /t 30 /nobreak > nul
    
    del "%INSTALL_DIR%nodejs-installer.msi"
) else (
    echo Node.js already installed.
    echo Node.js already installed. >> "%LOG_FILE%"
)

REM Step 3: Setup Portable MongoDB
echo.
echo [3/6] Setting up portable MongoDB...
echo [3/6] Setting up portable MongoDB... >> "%LOG_FILE%"

set "MONGO_DIR=%MEDIPOS_DIR%\database\mongodb"
set "MONGO_DATA_DIR=%MEDIPOS_DIR%\database\data"

if not exist "%MONGO_DIR%" (
    mkdir "%MONGO_DIR%"
    mkdir "%MONGO_DATA_DIR%"
    
    echo Downloading MongoDB...
    echo Downloading MongoDB... >> "%LOG_FILE%"
    
    REM Download MongoDB Community Server
    powershell -Command "Invoke-WebRequest -Uri 'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.5.zip' -OutFile '%INSTALL_DIR%mongodb.zip'"
    
    REM Extract MongoDB
    powershell -Command "Expand-Archive -Path '%INSTALL_DIR%mongodb.zip' -DestinationPath '%INSTALL_DIR%temp'"
    
    REM Move MongoDB files
    for /d %%d in ("%INSTALL_DIR%temp\mongodb-*") do (
        move "%%d\bin\*" "%MONGO_DIR%\"
    )
    
    REM Cleanup
    rmdir /s /q "%INSTALL_DIR%temp"
    del "%INSTALL_DIR%mongodb.zip"
)

REM Step 4: Copy Application Files
echo.
echo [4/6] Installing MediPOS application...
echo [4/6] Installing MediPOS application... >> "%LOG_FILE%"

REM Copy all application files
xcopy "%INSTALL_DIR%backend" "%MEDIPOS_DIR%\backend\" /E /I /Y >> "%LOG_FILE%"
xcopy "%INSTALL_DIR%frontend" "%MEDIPOS_DIR%\frontend\" /E /I /Y >> "%LOG_FILE%"
xcopy "%INSTALL_DIR%scripts" "%MEDIPOS_DIR%\scripts\" /E /I /Y >> "%LOG_FILE%"

REM Step 5: Install Application Dependencies
echo.
echo [5/6] Installing application dependencies...
echo [5/6] Installing application dependencies... >> "%LOG_FILE%"

REM Setup backend
cd /d "%MEDIPOS_DIR%\backend"
python -m venv venv >> "%LOG_FILE%" 2>&1
call venv\Scripts\activate
pip install -r requirements.txt >> "%LOG_FILE%" 2>&1

REM Create backend .env file
(
echo MONGO_URL=mongodb://localhost:27017
echo DB_NAME=medipos_production
echo CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
echo ENVIRONMENT=production
) > .env

REM Setup frontend
cd /d "%MEDIPOS_DIR%\frontend"
call npm install >> "%LOG_FILE%" 2>&1

REM Create frontend .env file
(
echo REACT_APP_BACKEND_URL=http://localhost:8001
echo GENERATE_SOURCEMAP=false
) > .env

REM Step 6: Create Shortcuts and Scripts
echo.
echo [6/6] Creating shortcuts and startup scripts...
echo [6/6] Creating shortcuts and startup scripts... >> "%LOG_FILE%"

REM Create enhanced startup script
(
echo @echo off
echo title MediPOS System - Starting...
echo.
echo Starting MediPOS Pharmacy Management System...
echo.
echo Starting MongoDB...
echo start /B "MongoDB" "%MEDIPOS_DIR%\database\mongodb\mongod.exe" --dbpath="%MEDIPOS_DIR%\database\data" --logpath="%MEDIPOS_DIR%\database\mongodb.log"
echo timeout /t 5 > nul
echo.
echo Starting Backend Server...
echo cd /d "%MEDIPOS_DIR%\backend"
echo start "MediPOS Backend" cmd /k "call venv\Scripts\activate && uvicorn server:app --host 0.0.0.0 --port 8001"
echo timeout /t 5 > nul
echo.
echo Starting Frontend...
echo cd /d "%MEDIPOS_DIR%\frontend"
echo start "MediPOS Frontend" cmd /k "npm start"
echo.
echo MediPOS is starting up...
echo The application will open in your web browser shortly.
echo.
echo To stop MediPOS, close both terminal windows.
) > "%MEDIPOS_DIR%\Start-MediPOS.bat"

REM Create stop script
(
echo @echo off
echo title MediPOS System - Stopping...
echo.
echo Stopping MediPOS Pharmacy Management System...
echo.
echo Stopping Node.js processes...
echo taskkill /F /IM node.exe /T > nul 2>&1
echo.
echo Stopping Python processes...
echo taskkill /F /IM python.exe /T > nul 2>&1
echo.
echo Stopping MongoDB...
echo taskkill /F /IM mongod.exe /T > nul 2>&1
echo.
echo MediPOS has been stopped.
echo.
echo Press any key to close this window...
echo pause > nul
) > "%MEDIPOS_DIR%\Stop-MediPOS.bat"

REM Create desktop shortcut
set "DESKTOP=%USERPROFILE%\Desktop"
(
echo [InternetShortcut]
echo URL=file:///%MEDIPOS_DIR%\Start-MediPOS.bat
echo IconFile=%MEDIPOS_DIR%\frontend\public\favicon.ico
) > "%DESKTOP%\MediPOS.url"

REM Final step: Installation complete
cls
echo ================================================================
echo                   Installation Complete!
echo ================================================================
echo.
echo MediPOS has been successfully installed to:
echo %MEDIPOS_DIR%
echo.
echo To start MediPOS:
echo  - Double-click the MediPOS shortcut on your desktop
echo  - OR run Start-MediPOS.bat from the installation folder
echo.
echo To stop MediPOS:
echo  - Run Stop-MediPOS.bat from the installation folder
echo  - OR close both terminal windows
echo.
echo Installation log saved to: %LOG_FILE%
echo.
echo ================================================================
echo                    Thank you for using MediPOS!
echo ================================================================
echo.
pause

echo Installation completed successfully: %DATE% %TIME% >> "%LOG_FILE%"
exit /b 0
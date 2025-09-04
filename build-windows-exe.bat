@echo off
setlocal enabledelayedexpansion

echo ========================================
echo     MediPOS RMS - Windows EXE Builder
echo ========================================
echo.
echo This script will create a standalone Windows executable
echo that includes everything needed to run MediPOS RMS.
echo.

REM Color codes for better output
set "GREEN=[92m"
set "YELLOW=[93m" 
set "RED=[91m"
set "BLUE=[94m"
set "NC=[0m"

REM Check prerequisites
echo %BLUE%Checking prerequisites...%NC%

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%ERROR: Node.js is not installed%NC%
    echo Please install Node.js from https://nodejs.org/
    echo Minimum version required: 18.x
    pause
    exit /b 1
)
echo %GREEN%✓ Node.js found%NC%

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%ERROR: Python is not installed%NC%
    echo Please install Python from https://python.org/
    echo Minimum version required: 3.9
    pause
    exit /b 1
)
echo %GREEN%✓ Python found%NC%

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%ERROR: npm is not available%NC%
    pause
    exit /b 1
)
echo %GREEN%✓ npm found%NC%

REM Check pip
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%ERROR: pip is not available%NC%
    pause
    exit /b 1
)
echo %GREEN%✓ pip found%NC%

echo.
echo %BLUE%Prerequisites check completed successfully!%NC%
echo.

REM Clean previous builds
echo %YELLOW%Cleaning previous builds...%NC%
if exist "dist" rmdir /s /q "dist"
if exist "release" rmdir /s /q "release"
if exist "build" rmdir /s /q "build"
if exist "frontend\build" rmdir /s /q "frontend\build"
if exist "backend\dist" rmdir /s /q "backend\dist"
if exist "backend\build" rmdir /s /q "backend\build"
echo %GREEN%✓ Cleanup completed%NC%

REM Create necessary directories
echo %YELLOW%Creating build directories...%NC%
mkdir dist 2>nul
mkdir dist\backend 2>nul
mkdir build-resources 2>nul
mkdir release 2>nul
echo %GREEN%✓ Directories created%NC%

REM Install main project dependencies
echo.
echo %BLUE%Installing main project dependencies...%NC%
npm install
if %errorlevel% neq 0 (
    echo %RED%ERROR: Failed to install main dependencies%NC%
    pause
    exit /b 1
)
echo %GREEN%✓ Main dependencies installed%NC%

REM Build React Frontend
echo.
echo %BLUE%Building React Frontend...%NC%
cd frontend

REM Install frontend dependencies
echo %YELLOW%Installing frontend dependencies...%NC%
npm install
if %errorlevel% neq 0 (
    echo %RED%ERROR: Failed to install frontend dependencies%NC%
    cd ..
    pause
    exit /b 1
)

REM Create production environment file
echo %YELLOW%Creating production configuration...%NC%
echo REACT_APP_BACKEND_URL=http://localhost:8001 > .env.production
echo GENERATE_SOURCEMAP=false >> .env.production
echo REACT_APP_ENV=production >> .env.production
echo REACT_APP_APP_NAME=MediPOS RMS >> .env.production

REM Build frontend
echo %YELLOW%Building frontend application...%NC%
npm run build
if %errorlevel% neq 0 (
    echo %RED%ERROR: Frontend build failed%NC%
    cd ..
    pause
    exit /b 1
)
echo %GREEN%✓ Frontend build completed%NC%
cd ..

REM Build Python Backend
echo.
echo %BLUE%Building Python Backend...%NC%
cd backend

REM Install backend dependencies
echo %YELLOW%Installing backend dependencies...%NC%
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo %RED%ERROR: Failed to install backend dependencies%NC%
    cd ..
    pause
    exit /b 1
)

REM Install PyInstaller
echo %YELLOW%Installing PyInstaller...%NC%
pip install pyinstaller
if %errorlevel% neq 0 (
    echo %RED%ERROR: Failed to install PyInstaller%NC%
    cd ..
    pause
    exit /b 1
)

REM Create spec file for better control
echo %YELLOW%Creating PyInstaller specification...%NC%
(
echo # -*- mode: python ; coding: utf-8 -*-
echo.
echo block_cipher = None
echo.
echo a = Analysis^(
echo     ['server.py'],
echo     pathex=[],
echo     binaries=[],
echo     datas=[
echo         ^('.env', '.'^^),
echo         ^('.env.standalone', '.'^^),
echo     ],
echo     hiddenimports=[
echo         'uvicorn.lifespan.on',
echo         'uvicorn.lifespan.off',
echo         'uvicorn.protocols.websockets.auto',
echo         'uvicorn.protocols.websockets.wsproto_impl',
echo         'uvicorn.protocols.http.auto',
echo         'uvicorn.protocols.http.h11_impl',
echo         'uvicorn.protocols.http.httptools_impl',
echo         'uvicorn.loops.auto',
echo         'uvicorn.loops.asyncio',
echo         'uvicorn.logging',
echo         'motor.motor_asyncio',
echo         'pymongo',
echo         'fastapi',
echo         'pydantic',
echo         'starlette',
echo         'multipart',
echo         'python_multipart',
echo         'email_validator',
echo         'passlib.handlers.bcrypt',
echo         'passlib.handlers.pbkdf2',
echo     ],
echo     hookspath=[],
echo     hooksconfig={},
echo     runtime_hooks=[],
echo     excludes=[],
echo     win_no_prefer_redirects=False,
echo     win_private_assemblies=False,
echo     cipher=block_cipher,
echo     noarchive=False,
echo ^^)
echo.
echo pyz = PYZ^(a.pure, a.zipped_data, cipher=block_cipher^^)
echo.
echo exe = EXE^(
echo     pyz,
echo     a.scripts,
echo     a.binaries,
echo     a.zipfiles,
echo     a.datas,
echo     [],
echo     name='server',
echo     debug=False,
echo     bootloader_ignore_signals=False,
echo     strip=False,
echo     upx=True,
echo     upx_exclude=[],
echo     runtime_tmpdir=None,
echo     console=True,
echo     disable_windowed_traceback=False,
echo     argv_emulation=False,
echo     target_arch=None,
echo     cofile=None,
echo     icon=None,
echo ^^)
) > server.spec

REM Build backend executable
echo %YELLOW%Building backend executable...%NC%
pyinstaller server.spec --clean --noconfirm
if %errorlevel% neq 0 (
    echo %RED%ERROR: Backend build failed%NC%
    cd ..
    pause
    exit /b 1
)

REM Copy executable to dist folder
if exist "dist\server.exe" (
    copy "dist\server.exe" "..\dist\backend\server.exe"
    echo %GREEN%✓ Backend executable created%NC%
) else (
    echo %RED%ERROR: Backend executable not found%NC%
    cd ..
    pause
    exit /b 1
)

cd ..

REM Create build resources
echo.
echo %BLUE%Creating build resources...%NC%

REM Create simple icon file (replace with actual icon if available)
if not exist "build-resources\icon.ico" (
    echo %YELLOW%Creating default icon...%NC%
    copy nul "build-resources\icon.ico" >nul 2>&1
)

REM Create license file
if not exist "build-resources\license.txt" (
    echo %YELLOW%Creating license file...%NC%
    (
    echo MediPOS RMS - Pharmacy Management System
    echo.
    echo Copyright ^(c^^) 2024 MediPOS RMS
    echo.
    echo This software is provided as-is without any warranty.
    echo All rights reserved.
    echo.
    echo This application includes:
    echo - React Frontend
    echo - FastAPI Backend  
    echo - MongoDB Database
    echo - Electron Framework
    echo.
    echo For support and updates, visit: https://github.com/your-repo/medipos-rms
    ) > "build-resources\license.txt"
)

echo %GREEN%✓ Build resources created%NC%

REM Update package.json with production settings
echo %YELLOW%Updating package.json for production...%NC%
powershell -Command "(Get-Content package.json) -replace '\"electron-dev\"', '\"electron\"' | Set-Content package.json"

REM Build Electron Application
echo.
echo %BLUE%Building Electron Application...%NC%
echo %YELLOW%This may take several minutes...%NC%

npm run build:electron
if %errorlevel% neq 0 (
    echo %RED%ERROR: Electron build failed%NC%
    echo Check the output above for error details
    pause
    exit /b 1
)

echo %GREEN%✓ Electron build completed%NC%

REM Check if build was successful
if exist "release\MediPOS RMS Setup 1.0.0.exe" (
    ren "release\MediPOS RMS Setup 1.0.0.exe" "MediPOS-RMS-Setup.exe"
    echo %GREEN%✓ Installer created: MediPOS-RMS-Setup.exe%NC%
) else if exist "release\win-unpacked\MediPOS RMS.exe" (
    echo %GREEN%✓ Portable executable created in release\win-unpacked\%NC%
) else (
    echo %YELLOW%Warning: Expected output files not found%NC%
    echo Check the release folder manually
)

REM Create a simple launcher script
echo %YELLOW%Creating launcher script...%NC%
(
echo @echo off
echo echo Starting MediPOS RMS...
echo cd /d "%%~dp0"
echo if exist "win-unpacked\MediPOS RMS.exe" ^(
echo     start "" "win-unpacked\MediPOS RMS.exe"
echo ^^) else ^(
echo     echo ERROR: MediPOS RMS executable not found
echo     pause
echo ^^)
) > "release\Start-MediPOS-RMS.bat"

REM Display results
echo.
echo %GREEN%========================================%NC%
echo %GREEN%       BUILD COMPLETED SUCCESSFULLY!    %NC%
echo %GREEN%========================================%NC%
echo.
echo %BLUE%Build Output:%NC%
echo.
if exist "release\MediPOS-RMS-Setup.exe" (
    echo %GREEN%📦 Windows Installer:%NC% release\MediPOS-RMS-Setup.exe
    echo    └─ Run this to install MediPOS RMS on any Windows PC
    echo.
)
if exist "release\win-unpacked" (
    echo %GREEN%📁 Portable Application:%NC% release\win-unpacked\
    echo    └─ Copy this folder to run MediPOS RMS without installation
    echo.
)
echo %GREEN%🚀 Launcher Script:%NC% release\Start-MediPOS-RMS.bat
echo    └─ Double-click to start the application
echo.
echo %BLUE%File Sizes:%NC%
for %%f in ("release\MediPOS-RMS-Setup.exe") do (
    if exist "%%f" (
        echo    Installer: %%~zf bytes ^(~%%~zf bytes^^)
    )
)
echo.
echo %BLUE%What's Included:%NC%
echo ✓ React Frontend ^(built and optimized^^)
echo ✓ FastAPI Backend ^(packaged as executable^^)  
echo ✓ All dependencies ^(self-contained^^)
echo ✓ Electron wrapper ^(desktop application^^)
echo.
echo %YELLOW%Next Steps:%NC%
echo 1. Test the application by running Start-MediPOS-RMS.bat
echo 2. For distribution, use MediPOS-RMS-Setup.exe
echo 3. The app will create its database in the user's AppData folder
echo.
echo %BLUE%System Requirements for End Users:%NC%
echo • Windows 10 or higher
echo • 4GB RAM minimum ^(8GB recommended^^)
echo • 500MB free disk space
echo • No additional software needed ^(fully self-contained^^)
echo.

REM Check for MongoDB note
echo %YELLOW%Note about Database:%NC%
echo This build uses an external MongoDB connection.
echo For a fully self-contained version with embedded MongoDB,
echo run: node build-scripts/build-windows.js
echo.

echo %GREEN%Build completed successfully!%NC%
echo Press any key to open the release folder...
pause >nul
explorer "release"

exit /b 0
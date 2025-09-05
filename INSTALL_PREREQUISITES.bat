@echo off
echo ========================================
echo    MediPOS Prerequisites Installer
echo ========================================
echo.

echo Choose your preferred installation method:
echo.
echo 1. PowerShell (Recommended) - Advanced installer with progress bars
echo 2. Batch Script - Simple installer for older systems
echo 3. Manual Installation - Get download links only
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto :powershell
if "%choice%"=="2" goto :batch
if "%choice%"=="3" goto :manual
goto :invalid

:powershell
echo.
echo Starting PowerShell installer...
echo This will download and install Python, Node.js, MongoDB, and Git automatically.
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0install_prerequisites.ps1"
goto :end

:batch
echo.
echo Starting Batch installer...
echo This will download and install Python, Node.js, MongoDB, and 7-Zip automatically.
echo.
call "%~dp0install_prerequisites.bat"
goto :end

:manual
echo.
echo ========================================
echo      Manual Installation Links
echo ========================================
echo.
echo Please download and install the following software:
echo.
echo 1. Python 3.11 (REQUIRED)
echo    https://www.python.org/downloads/
echo    ⚠️  IMPORTANT: Check "Add Python to PATH" during installation
echo.
echo 2. Node.js 20 LTS (REQUIRED)
echo    https://nodejs.org/
echo    Use default installation settings
echo.
echo 3. MongoDB Community Server 7.0 (REQUIRED)
echo    https://www.mongodb.com/try/download/community
echo    Choose Windows x64, install as Windows service
echo.
echo 4. 7-Zip (Optional - for extracting archives)
echo    https://www.7-zip.org/download.html
echo    Download the 64-bit Windows x64 version
echo.
echo 5. Git for Windows (Optional - for version control)
echo    https://git-scm.com/download/win
echo    Use default installation settings
echo.
echo After installing all software:
echo 1. Restart your computer
echo 2. Extract MediPOS_Windows_Complete.tar.gz
echo 3. Run setup_windows.bat
echo 4. Run start_medipos.bat
echo.
goto :end

:invalid
echo Invalid choice. Please run the script again and choose 1, 2, or 3.
goto :end

:end
echo.
echo ========================================
echo.
echo After prerequisites are installed:
echo 1. Extract your MediPOS archive
echo 2. Run setup_windows.bat 
echo 3. Run start_medipos.bat
echo 4. Access http://localhost:3000
echo.
pause
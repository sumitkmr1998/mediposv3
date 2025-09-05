# MediPOS Prerequisites Installer - PowerShell Version
# Requires PowerShell 5.0+ and Administrator privileges for full functionality

param(
    [switch]$Force,
    [switch]$SkipConfirmation
)

# Set execution policy for this session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    MediPOS Prerequisites Installer" -ForegroundColor White
Write-Host "       PowerShell Automated Setup" -ForegroundColor White  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "⚠️  WARNING: Not running as Administrator" -ForegroundColor Yellow
    Write-Host "Some installations may fail without Administrator privileges." -ForegroundColor Yellow
    Write-Host "Right-click PowerShell and select 'Run as Administrator' for best results." -ForegroundColor Yellow
    Write-Host ""
    
    if (-not $SkipConfirmation) {
        $continue = Read-Host "Continue anyway? (Y/N)"
        if ($continue -ne "Y" -and $continue -ne "y") {
            Write-Host "Installation cancelled." -ForegroundColor Red
            exit 1
        }
    }
}

# Function to test internet connectivity
function Test-InternetConnection {
    try {
        $response = Invoke-WebRequest -Uri "https://www.google.com" -TimeoutSec 10 -UseBasicParsing
        return $true
    }
    catch {
        return $false
    }
}

# Function to download file with progress
function Download-File {
    param(
        [string]$Url,
        [string]$OutputPath,
        [string]$Description
    )
    
    try {
        Write-Host "Downloading $Description..." -ForegroundColor Yellow
        
        # Use WebClient for progress display
        $webClient = New-Object System.Net.WebClient
        
        # Register progress event
        Register-ObjectEvent -InputObject $webClient -EventName DownloadProgressChanged -Action {
            $percentage = $Event.SourceEventArgs.ProgressPercentage
            Write-Progress -Activity "Downloading $Description" -Status "$percentage% Complete:" -PercentComplete $percentage
        } | Out-Null
        
        $webClient.DownloadFile($Url, $OutputPath)
        $webClient.Dispose()
        
        Write-Progress -Activity "Downloading $Description" -Completed
        Write-Host "✅ Download completed: $Description" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Download failed: $Description" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to check if software is installed
function Test-SoftwareInstalled {
    param(
        [string]$SoftwareName,
        [string]$CommandTest
    )
    
    try {
        if ($CommandTest) {
            $null = Invoke-Expression "$CommandTest --version" 2>&1
            return $true
        }
        else {
            $software = Get-WmiObject -Class Win32_Product | Where-Object { $_.Name -like "*$SoftwareName*" }
            return $software -ne $null
        }
    }
    catch {
        return $false
    }
}

Write-Host "Checking internet connectivity..." -ForegroundColor Yellow
if (-not (Test-InternetConnection)) {
    Write-Host "❌ ERROR: No internet connection detected" -ForegroundColor Red
    Write-Host "Please check your internet connection and try again." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Internet connection verified" -ForegroundColor Green
Write-Host ""

# Create temporary directory
$tempDir = Join-Path $env:TEMP "medipos_setup"
if (-not (Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir | Out-Null
}
Set-Location $tempDir

Write-Host "This script will install:" -ForegroundColor White
Write-Host "1. Python 3.11 (Latest stable)" -ForegroundColor Gray
Write-Host "2. Node.js 20 LTS (Latest LTS)" -ForegroundColor Gray  
Write-Host "3. MongoDB Community 7.0" -ForegroundColor Gray
Write-Host "4. Git for Windows (Version control)" -ForegroundColor Gray
Write-Host "5. Visual Studio Code (Optional)" -ForegroundColor Gray
Write-Host ""

if (-not $SkipConfirmation) {
    $confirm = Read-Host "Continue with installation? (Y/N)"
    if ($confirm -ne "Y" -and $confirm -ne "y") {
        Write-Host "Installation cancelled." -ForegroundColor Red
        exit 0
    }
}

Write-Host ""
Write-Host "Starting installations..." -ForegroundColor Cyan
Write-Host ""

# ========================================
# Install Python 3.11
# ========================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing 1/5: Python 3.11" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

$pythonInstalled = Test-SoftwareInstalled -CommandTest "python"
if ($pythonInstalled -and -not $Force) {
    $pythonVersion = python --version 2>&1
    Write-Host "Python is already installed: $pythonVersion" -ForegroundColor Green
    
    $reinstall = Read-Host "Reinstall Python anyway? (Y/N)"
    if ($reinstall -ne "Y" -and $reinstall -ne "y") {
        Write-Host "Skipping Python installation." -ForegroundColor Yellow
        $pythonInstalled = $true
    } else {
        $pythonInstalled = $false
    }
}

if (-not $pythonInstalled -or $Force) {
    $pythonUrl = "https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe"
    $pythonFile = Join-Path $tempDir "python-installer.exe"
    
    if (Download-File -Url $pythonUrl -OutputPath $pythonFile -Description "Python 3.11") {
        Write-Host "Installing Python 3.11..." -ForegroundColor Yellow
        
        $pythonArgs = @(
            "/quiet",
            "InstallAllUsers=1",
            "PrependPath=1", 
            "Include_test=0",
            "Include_doc=0",
            "Include_dev=0",
            "Include_debug=0",
            "Include_launcher=1",
            "InstallLauncherAllUsers=1"
        )
        
        Start-Process -FilePath $pythonFile -ArgumentList $pythonArgs -Wait -NoNewWindow
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        # Verify installation
        Start-Sleep -Seconds 3
        try {
            $pythonVersion = python --version 2>&1
            Write-Host "✅ Python installed successfully: $pythonVersion" -ForegroundColor Green
        }
        catch {
            Write-Host "⚠️  Python installation may need a system restart to work properly" -ForegroundColor Yellow
        }
        
        Remove-Item $pythonFile -Force -ErrorAction SilentlyContinue
    }
}

# ========================================
# Install Node.js 20 LTS
# ========================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing 2/5: Node.js 20 LTS" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

$nodeInstalled = Test-SoftwareInstalled -CommandTest "node"
if ($nodeInstalled -and -not $Force) {
    $nodeVersion = node --version 2>&1
    Write-Host "Node.js is already installed: $nodeVersion" -ForegroundColor Green
    
    $reinstall = Read-Host "Reinstall Node.js anyway? (Y/N)"
    if ($reinstall -ne "Y" -and $reinstall -ne "y") {
        Write-Host "Skipping Node.js installation." -ForegroundColor Yellow
        $nodeInstalled = $true
    } else {
        $nodeInstalled = $false
    }
}

if (-not $nodeInstalled -or $Force) {
    $nodeUrl = "https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi"
    $nodeFile = Join-Path $tempDir "nodejs-installer.msi"
    
    if (Download-File -Url $nodeUrl -OutputPath $nodeFile -Description "Node.js 20 LTS") {
        Write-Host "Installing Node.js 20 LTS..." -ForegroundColor Yellow
        
        Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$nodeFile`" /quiet /norestart" -Wait -NoNewWindow
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        # Verify installation
        Start-Sleep -Seconds 3
        try {
            $nodeVersion = node --version 2>&1
            Write-Host "✅ Node.js installed successfully: $nodeVersion" -ForegroundColor Green
            
            # Install Yarn
            Write-Host "Installing Yarn package manager..." -ForegroundColor Yellow
            npm install -g yarn 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Yarn installed successfully" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "⚠️  Node.js installation may need a system restart to work properly" -ForegroundColor Yellow
        }
        
        Remove-Item $nodeFile -Force -ErrorAction SilentlyContinue
    }
}

# ========================================
# Install MongoDB Community 7.0
# ========================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing 3/5: MongoDB Community 7.0" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService -and -not $Force) {
    Write-Host "MongoDB service is already installed." -ForegroundColor Green
    
    $reinstall = Read-Host "Reinstall MongoDB anyway? (Y/N)"
    if ($reinstall -ne "Y" -and $reinstall -ne "y") {
        Write-Host "Skipping MongoDB installation." -ForegroundColor Yellow
        
        # Ensure service is running
        if ($mongoService.Status -ne "Running") {
            Write-Host "Starting MongoDB service..." -ForegroundColor Yellow
            Start-Service -Name "MongoDB" -ErrorAction SilentlyContinue
            if ($?) {
                Write-Host "✅ MongoDB service started" -ForegroundColor Green
            }
        }
        $mongoInstalled = $true
    } else {
        $mongoInstalled = $false
    }
} else {
    $mongoInstalled = $false
}

if (-not $mongoInstalled -or $Force) {
    $mongoUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.14-signed.msi"
    $mongoFile = Join-Path $tempDir "mongodb-installer.msi"
    
    Write-Host "This is a large download (~200MB), please wait..." -ForegroundColor Yellow
    
    if (Download-File -Url $mongoUrl -OutputPath $mongoFile -Description "MongoDB Community 7.0") {
        Write-Host "Installing MongoDB Community 7.0..." -ForegroundColor Yellow
        Write-Host "This may take several minutes..." -ForegroundColor Yellow
        
        # Create MongoDB data directory
        $mongoDataDir = "C:\data\db"
        if (-not (Test-Path $mongoDataDir)) {
            New-Item -ItemType Directory -Path $mongoDataDir -Force | Out-Null
            Write-Host "Created MongoDB data directory: $mongoDataDir" -ForegroundColor Gray
        }
        
        # Install MongoDB
        $mongoArgs = @(
            "/i", "`"$mongoFile`"",
            "/quiet",
            "/norestart",
            "INSTALLLOCATION=`"C:\Program Files\MongoDB\Server\7.0\`"",
            "ADDLOCAL=MongoDBServer,MongoDBShell",
            "SHOULD_INSTALL_COMPASS=0"
        )
        
        Start-Process -FilePath "msiexec.exe" -ArgumentList $mongoArgs -Wait -NoNewWindow
        
        # Verify installation and start service
        Start-Sleep -Seconds 5
        $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
        if ($mongoService) {
            Write-Host "✅ MongoDB installed successfully" -ForegroundColor Green
            
            if ($mongoService.Status -ne "Running") {
                Write-Host "Starting MongoDB service..." -ForegroundColor Yellow
                Start-Service -Name "MongoDB" -ErrorAction SilentlyContinue
                if ($?) {
                    Write-Host "✅ MongoDB service started" -ForegroundColor Green
                } else {
                    Write-Host "⚠️  MongoDB service failed to start - you may need to start it manually" -ForegroundColor Yellow
                }
            } else {
                Write-Host "✅ MongoDB service is running" -ForegroundColor Green
            }
        } else {
            Write-Host "⚠️  MongoDB installation completed but service not found" -ForegroundColor Yellow
        }
        
        Remove-Item $mongoFile -Force -ErrorAction SilentlyContinue
    }
}

# ========================================
# Install Git for Windows
# ========================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing 4/5: Git for Windows" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

$gitInstalled = Test-SoftwareInstalled -CommandTest "git"
if ($gitInstalled -and -not $Force) {
    $gitVersion = git --version 2>&1
    Write-Host "Git is already installed: $gitVersion" -ForegroundColor Green
} else {
    $gitUrl = "https://github.com/git-for-windows/git/releases/download/v2.47.0.windows.2/Git-2.47.0.2-64-bit.exe"
    $gitFile = Join-Path $tempDir "git-installer.exe"
    
    if (Download-File -Url $gitUrl -OutputPath $gitFile -Description "Git for Windows") {
        Write-Host "Installing Git for Windows..." -ForegroundColor Yellow
        
        $gitArgs = @(
            "/VERYSILENT",
            "/NORESTART",
            "/NOCANCEL",
            "/SP-",
            "/CLOSEAPPLICATIONS",
            "/RESTARTAPPLICATIONS",
            "/COMPONENTS=`"icons,ext\reg\shellhere,assoc,assoc_sh`""
        )
        
        Start-Process -FilePath $gitFile -ArgumentList $gitArgs -Wait -NoNewWindow
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        Start-Sleep -Seconds 3
        try {
            $gitVersion = git --version 2>&1
            Write-Host "✅ Git installed successfully: $gitVersion" -ForegroundColor Green
        }
        catch {
            Write-Host "⚠️  Git installation may need a system restart to work properly" -ForegroundColor Yellow
        }
        
        Remove-Item $gitFile -Force -ErrorAction SilentlyContinue
    }
}

# ========================================
# Optional: Install Visual Studio Code
# ========================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing 5/5: Visual Studio Code (Optional)" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

$installVscode = Read-Host "Install Visual Studio Code for development? (Y/N)"
if ($installVscode -eq "Y" -or $installVscode -eq "y") {
    $vscodeInstalled = Test-Path "${env:ProgramFiles}\Microsoft VS Code\Code.exe"
    
    if (-not $vscodeInstalled -or $Force) {
        $vscodeUrl = "https://code.visualstudio.com/sha/download?build=stable&os=win32-x64"
        $vscodeFile = Join-Path $tempDir "vscode-installer.exe"
        
        if (Download-File -Url $vscodeUrl -OutputPath $vscodeFile -Description "Visual Studio Code") {
            Write-Host "Installing Visual Studio Code..." -ForegroundColor Yellow
            
            $vscodeArgs = @(
                "/VERYSILENT",
                "/NORESTART",
                "/MERGETASKS=!runcode"
            )
            
            Start-Process -FilePath $vscodeFile -ArgumentList $vscodeArgs -Wait -NoNewWindow
            
            if (Test-Path "${env:ProgramFiles}\Microsoft VS Code\Code.exe") {
                Write-Host "✅ Visual Studio Code installed successfully" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Visual Studio Code installation may have failed" -ForegroundColor Yellow
            }
            
            Remove-Item $vscodeFile -Force -ErrorAction SilentlyContinue
        }
    } else {
        Write-Host "Visual Studio Code is already installed." -ForegroundColor Green
    }
} else {
    Write-Host "Skipping Visual Studio Code installation." -ForegroundColor Yellow
}

# ========================================
# Cleanup and Final Verification
# ========================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cleaning up and verifying installations..." -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

# Cleanup temporary directory
Set-Location $env:USERPROFILE
Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue

# Refresh environment variables one final time
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    Prerequisites Installation Complete!" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Final verification:" -ForegroundColor White
Write-Host ""

# Verify all installations
$verificationResults = @()

# Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
    $verificationResults += "Python: OK"
}
catch {
    Write-Host "❌ Python: NOT FOUND" -ForegroundColor Red
    $verificationResults += "Python: FAILED"
}

# Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    $verificationResults += "Node.js: OK"
}
catch {
    Write-Host "❌ Node.js: NOT FOUND" -ForegroundColor Red
    $verificationResults += "Node.js: FAILED"
}

# MongoDB
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService) {
    if ($mongoService.Status -eq "Running") {
        Write-Host "✅ MongoDB: Service running" -ForegroundColor Green
        $verificationResults += "MongoDB: OK"
    } else {
        Write-Host "⚠️  MongoDB: Service installed but not running" -ForegroundColor Yellow
        $verificationResults += "MongoDB: PARTIAL"
    }
} else {
    Write-Host "❌ MongoDB: Service not found" -ForegroundColor Red
    $verificationResults += "MongoDB: FAILED"
}

# Git
try {
    $gitVersion = git --version 2>&1
    Write-Host "✅ Git: $gitVersion" -ForegroundColor Green
    $verificationResults += "Git: OK"
}
catch {
    Write-Host "❌ Git: NOT FOUND" -ForegroundColor Red
    $verificationResults += "Git: FAILED"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "         Next Steps:" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. ✅ Prerequisites are now installed" -ForegroundColor Green
Write-Host "2. 📦 Extract your MediPOS archive (MediPOS_Windows_Complete.tar.gz)" -ForegroundColor Gray
Write-Host "3. 🔧 Run setup_windows.bat in the extracted folder" -ForegroundColor Gray
Write-Host "4. 🚀 Run start_medipos.bat to start the application" -ForegroundColor Gray
Write-Host "5. 🌐 Access http://localhost:3000 (Login: admin/admin123)" -ForegroundColor Gray
Write-Host ""

$failedInstalls = $verificationResults | Where-Object { $_ -like "*FAILED*" }
if ($failedInstalls.Count -gt 0) {
    Write-Host "⚠️  Some installations failed. You may need to:" -ForegroundColor Yellow
    Write-Host "   - Restart your computer" -ForegroundColor Yellow
    Write-Host "   - Run this script as Administrator" -ForegroundColor Yellow
    Write-Host "   - Install missing components manually" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Installation completed! 🎉" -ForegroundColor Green
Write-Host "Thank you for installing MediPOS! 🏥" -ForegroundColor Cyan
Write-Host ""

# Keep PowerShell window open if run directly
if ($MyInvocation.InvocationName -ne "&") {
    Read-Host "Press Enter to exit"
}
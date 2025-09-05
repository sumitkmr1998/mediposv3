# 🪟 MediPOS Windows Installation Guide

## 🎯 Complete Setup Guide for Windows

This guide will help you run the MediPOS pharmacy management system on Windows with reverse proxy configuration for multi-device access.

## 📋 Prerequisites Installation

### 🚀 **Automated Installation (Recommended)**

**Option 1: One-Click Installer**
1. Extract your MediPOS package
2. **Double-click: `INSTALL_PREREQUISITES.bat`**
3. Choose installation method:
   - **PowerShell (Recommended)**: Advanced installer with progress bars
   - **Batch Script**: Simple installer for older systems  
   - **Manual**: Get download links only

**What gets installed automatically:**
- ✅ **Python 3.11** (with PATH configuration)
- ✅ **Node.js 20 LTS** (with npm and yarn)
- ✅ **MongoDB Community 7.0** (as Windows service)
- ✅ **Git for Windows** (version control)
- ✅ **7-Zip** (for archive extraction)

### 🛠️ **Manual Installation (If needed)**

**1. 🐍 Python 3.11**
- Download: https://www.python.org/downloads/
- **⚠️ IMPORTANT**: Check "Add Python to PATH" during installation
- Verify: `python --version`

**2. 🟢 Node.js 20 LTS**
- Download: https://nodejs.org/
- Install with default settings
- Verify: `node --version`

**3. 🗄️ MongoDB Community 7.0**
- Download: https://www.mongodb.com/try/download/community
- Install as Windows service
- Verify: `net start MongoDB`

**4. 📦 Additional Tools**
```cmd
npm install -g yarn    # Better package manager
```

## 🚀 Installation Steps

### Step 1: Extract the Application
1. Download either archive:
   - `MediPOS_Complete_Package.tar.gz` (210MB - includes everything)
   - `MediPOS_with_ReverseProxy.tar.gz` (71MB - lightweight)

2. Extract using Windows tools or 7-Zip:
   - If using 7-Zip: Right-click → 7-Zip → Extract Here
   - If using Windows: Right-click → Extract All

3. Navigate to the extracted folder:
```cmd
cd medipos_package
```

### Step 2: Find Your Windows IP Address
Open Command Prompt and run:
```cmd
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually starts with 192.168.x.x or 10.x.x.x)

**Example Output:**
```
Ethernet adapter Ethernet:
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
```

### Step 3: Update Configuration Files

**Edit `backend\.env`** (use Notepad or any text editor):
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=medipos_db
SECRET_KEY=your-secret-key-change-this-in-production-medipos-2024
HOST=0.0.0.0
PORT=8001
CORS_ORIGINS=http://localhost:3000,http://192.168.1.100:3000,http://127.0.0.1:3000
```
*Replace `192.168.1.100` with your actual IP address*

**Edit `frontend\.env`**:
```env
REACT_APP_BACKEND_URL=http://192.168.1.100:8001
PORT=3000
HOST=0.0.0.0
```
*Replace `192.168.1.100` with your actual IP address*

### Step 4: Install Backend Dependencies
Open Command Prompt and navigate to backend folder:
```cmd
cd backend
pip install -r requirements.txt
```

### Step 5: Install Frontend Dependencies
Open a new Command Prompt and navigate to frontend folder:
```cmd
cd frontend
yarn install
# OR if you prefer npm:
npm install
```

## 🏃‍♂️ Running the Application

### Method 1: Manual Start (3 Command Prompts)

**Command Prompt 1 - MongoDB (if not running as service):**
```cmd
mongod
```
*If MongoDB is installed as a service, it should already be running*

**Command Prompt 2 - Backend:**
```cmd
cd backend
python server.py
```
You should see:
```
🚀 Starting MediPOS Backend Server...
✅ Database connection established successfully!
🎉 MediPOS Backend Server started successfully!
```

**Command Prompt 3 - Frontend:**
```cmd
cd frontend
yarn start
# OR: npm start
```
You should see:
```
You can now view frontend in the browser.
  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.100:3000
```

### Method 2: Using Batch Files (Easier)

Create these batch files in your main folder:

**`start_backend.bat`:**
```batch
@echo off
cd backend
echo Starting MediPOS Backend...
python server.py
pause
```

**`start_frontend.bat`:**
```batch
@echo off
cd frontend
echo Starting MediPOS Frontend...
yarn start
pause
```

**`start_medipos.bat`:**
```batch
@echo off
echo Starting MediPOS Application...
start "MediPOS Backend" start_backend.bat
timeout /t 5
start "MediPOS Frontend" start_frontend.bat
echo MediPOS is starting...
echo Backend: http://localhost:8001
echo Frontend: http://localhost:3000
echo Network Access: http://YOUR_IP:3000
pause
```

## 🌐 Accessing MediPOS

### From the Same Computer:
- Open browser: `http://localhost:3000`
- Login: `admin` / `admin123`

### From Other Devices (Mobile, Tablet, Other PCs):
1. Ensure devices are on the same WiFi network
2. Open browser: `http://192.168.1.100:3000` (replace with your IP)
3. Login: `admin` / `admin123`

## 🔧 Windows-Specific Configuration

### Windows Firewall Setup:
1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Click "Change Settings" → "Allow another app"
4. Add Python and Node.js applications
5. Or temporarily disable firewall for testing

### Alternative: Create Firewall Rules via Command Prompt (Run as Administrator):
```cmd
netsh advfirewall firewall add rule name="MediPOS Backend" dir=in action=allow protocol=TCP localport=8001
netsh advfirewall firewall add rule name="MediPOS Frontend" dir=in action=allow protocol=TCP localport=3000
```

## 🛠️ Troubleshooting

### Issue: "python is not recognized"
**Solution:**
1. Reinstall Python with "Add to PATH" checked
2. Or manually add Python to PATH:
   - Search "Environment Variables" in Windows
   - Edit PATH variable
   - Add Python installation folder (e.g., `C:\Python311\`)

### Issue: "MongoDB connection failed"
**Solutions:**
1. **Check if MongoDB is running:**
   ```cmd
   net start MongoDB
   ```

2. **Start MongoDB manually:**
   ```cmd
   "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
   ```

3. **Create data directory:**
   ```cmd
   mkdir C:\data\db
   ```

### Issue: Cannot access from other devices
**Solutions:**
1. **Check Windows Firewall** (see above)
2. **Verify network connectivity:**
   ```cmd
   ping 192.168.1.100
   ```
3. **Test ports:**
   ```cmd
   netstat -an | find "3000"
   netstat -an | find "8001"
   ```

### Issue: Frontend shows "Network Error"
**Solutions:**
1. **Check backend .env CORS settings**
2. **Verify backend is accessible:**
   ```cmd
   curl http://192.168.1.100:8001/api/health
   ```
3. **Check frontend .env backend URL**

### Issue: "Permission denied" errors
**Solution:**
- Run Command Prompt as Administrator
- Or change folder permissions

## 📱 Testing Network Access

### Create Network Test File:
Save this as `test_network.html` and open in browser from other devices:

```html
<!DOCTYPE html>
<html>
<head><title>MediPOS Network Test</title></head>
<body>
    <h1>MediPOS Network Test</h1>
    <button onclick="testConnection()">Test Connection</button>
    <div id="result"></div>
    
    <script>
    async function testConnection() {
        const serverIP = '192.168.1.100'; // Update with your IP
        const result = document.getElementById('result');
        
        try {
            const response = await fetch(`http://${serverIP}:8001/api/health`);
            const data = await response.json();
            result.innerHTML = `<p style="color:green">✅ SUCCESS: ${data.status}</p>`;
        } catch (error) {
            result.innerHTML = `<p style="color:red">❌ ERROR: ${error.message}</p>`;
        }
    }
    </script>
</body>
</html>
```

## 🔐 Security & Production Notes

### Change Default Password:
1. Login with `admin`/`admin123`
2. Go to Settings → User Management
3. Change admin password immediately

### Production Deployment:
1. **Use environment variables** for sensitive data
2. **Configure proper SSL/HTTPS** for external access
3. **Set strong SECRET_KEY** in backend .env
4. **Configure proper backup** for MongoDB
5. **Use Windows Service** for automatic startup

### Creating Windows Services (Optional):
Use tools like NSSM (Non-Sucking Service Manager) to run as Windows services:
```cmd
# Download NSSM from https://nssm.cc/
nssm install MediPOSBackend python C:\path\to\your\backend\server.py
nssm install MediPOSFrontend yarn C:\path\to\your\frontend start
```

## 📞 Quick Reference

### Default URLs:
- **Application**: `http://YOUR_IP:3000`
- **API Docs**: `http://YOUR_IP:8001/docs`
- **Health Check**: `http://YOUR_IP:8001/api/health`

### Default Login:
- **Username**: `admin`
- **Password**: `admin123`

### Common Commands:
```cmd
# Check running processes
netstat -an | find "3000"
netstat -an | find "8001"

# Check MongoDB
net start MongoDB

# Find your IP
ipconfig | find "IPv4"

# Test API
curl http://localhost:8001/api/health
```

## 🎉 Success Checklist

✅ Python installed and in PATH
✅ Node.js installed
✅ MongoDB running
✅ Backend dependencies installed
✅ Frontend dependencies installed
✅ IP address configured in .env files
✅ Windows Firewall allows ports 3000 and 8001
✅ Backend starts without errors
✅ Frontend starts and shows network URL
✅ Can access from same computer: `http://localhost:3000`
✅ Can access from other devices: `http://YOUR_IP:3000`
✅ Login works with admin/admin123

Your MediPOS system is now ready for Windows! 🚀
# 🪟 MediPOS Windows Installation Package

## 📦 Windows-Optimized Download

### 🎁 **MediPOS_Windows_Complete.tar.gz** (350MB)
- **Complete Windows-ready package** with batch files and setup scripts
- **Includes everything** needed to run MediPOS on Windows
- **Easy installation** with automated setup scripts
- **Network reverse proxy** pre-configured

## 🚀 Quick Start for Windows

### 1️⃣ **Download & Extract**
1. Download `MediPOS_Windows_Complete.tar.gz`
2. Extract using 7-Zip or Windows built-in tools
3. Navigate to the extracted `medipos_windows_package` folder

### 2️⃣ **Run System Check**
Double-click: **`check_system.bat`**
- Checks if Python, Node.js, and MongoDB are installed
- Detects your network IP address
- Verifies all required files are present

### 3️⃣ **Automated Setup**
Double-click: **`setup_windows.bat`**
- Automatically configures network settings
- Installs all dependencies
- Sets up Windows Firewall rules
- Updates configuration files with your IP

### 4️⃣ **Start Application**
Double-click: **`start_medipos.bat`**
- Starts both backend and frontend automatically
- Opens application in your browser
- Shows network URLs for other devices

## 📋 Prerequisites

### Required Software:
- ✅ **Python 3.8+** - [Download](https://python.org/downloads/)
- ✅ **Node.js 16+** - [Download](https://nodejs.org/)
- ✅ **MongoDB** - [Download](https://www.mongodb.com/try/download/community)

### Installation Tips:
- **Python**: Check "Add Python to PATH" during installation
- **Node.js**: Use default settings
- **MongoDB**: Install as Windows service

## 🛠️ Included Windows Batch Files

### 🔧 **Setup & Diagnostics:**
- **`check_system.bat`** - Verify system requirements
- **`setup_windows.bat`** - Automated configuration and setup

### 🚀 **Application Launchers:**
- **`start_medipos.bat`** - Start complete application (recommended)
- **`start_backend.bat`** - Start backend server only
- **`start_frontend.bat`** - Start frontend application only

### 📁 **Key Features of Batch Files:**
- ✅ Automatic IP detection and configuration
- ✅ Dependency installation
- ✅ Error checking and troubleshooting tips
- ✅ Windows Firewall configuration
- ✅ MongoDB service management
- ✅ Browser auto-launch

## 🌐 Network Access on Windows

### **Your Computer:**
- Access: `http://localhost:3000`
- Login: `admin` / `admin123`

### **Mobile Devices & Other Computers:**
1. Connect to same WiFi network
2. Find your IP in Command Prompt: `ipconfig`
3. Access: `http://YOUR_IP:3000` (e.g., `http://192.168.1.100:3000`)
4. Login: `admin` / `admin123`

## 🔧 Windows-Specific Solutions

### **Firewall Issues:**
```cmd
# Run as Administrator to add firewall rules:
netsh advfirewall firewall add rule name="MediPOS Backend" dir=in action=allow protocol=TCP localport=8001
netsh advfirewall firewall add rule name="MediPOS Frontend" dir=in action=allow protocol=TCP localport=3000
```

### **MongoDB Service Management:**
```cmd
# Start MongoDB service:
net start MongoDB

# Stop MongoDB service:
net stop MongoDB

# Check MongoDB status:
sc query MongoDB
```

### **Finding Your IP Address:**
```cmd
# Get your network IP:
ipconfig | findstr IPv4
```

## 🏥 MediPOS Features on Windows

### **Complete Pharmacy Management:**
- 💊 **Medicine Inventory** - Stock tracking, expiry management
- 👤 **Patient Records** - Complete patient information system
- 💰 **Sales & POS** - Transaction processing with receipts
- 👨‍⚕️ **Doctor Management** - Doctor profiles and signatures
- 📋 **OPD Prescriptions** - Digital prescription creation
- 📊 **Analytics** - Sales reports and business insights
- ⚙️ **Settings** - System configuration and user management

### **Windows-Optimized Features:**
- 🖨️ **Windows Printer Support** - Direct receipt printing
- 📁 **File System Integration** - Easy backup and data export
- 🔔 **Windows Notifications** - System alerts and reminders
- 🖥️ **Multi-Monitor Support** - Full screen POS interface

## 🛠️ Troubleshooting Windows Issues

### **Common Problems & Solutions:**

**"Python is not recognized":**
- Reinstall Python with "Add to PATH" checked
- Or manually add to PATH in Environment Variables

**"MongoDB connection failed":**
- Run: `net start MongoDB`
- Check Windows Services for MongoDB
- Ensure port 27017 is not blocked

**"Cannot access from mobile device":**
- Check Windows Firewall settings
- Run batch files as Administrator
- Verify devices are on same network

**"Port already in use":**
- Close other applications using ports 3000 or 8001
- Restart your computer if needed

## 🔐 Security for Windows

### **Default Credentials:**
- Username: `admin`
- Password: `admin123`
- **⚠️ IMPORTANT:** Change password after first login!

### **Windows Security:**
- Windows Defender may scan downloaded files
- Add MediPOS folder to exclusions for better performance
- Use Windows User Account Control appropriately

## 📞 Windows Support

### **Quick Commands:**
```cmd
# Check Python installation:
python --version

# Check Node.js installation:
node --version

# Check MongoDB service:
sc query MongoDB

# Find your IP address:
ipconfig

# Test network connectivity:
ping YOUR_IP_ADDRESS
```

### **Log Files Location:**
- Backend errors: Check Command Prompt window
- Frontend errors: Check browser Developer Tools (F12)
- MongoDB logs: `C:\Program Files\MongoDB\Server\7.0\log\`

## 🎉 Success on Windows

**You'll know it's working when:**
- ✅ `check_system.bat` shows all green checkmarks
- ✅ `start_medipos.bat` opens browser automatically
- ✅ Login page appears with demo credentials shown
- ✅ Dashboard loads after login
- ✅ Mobile devices can access `http://YOUR_IP:3000`
- ✅ All pharmacy features work correctly

## 📱 Mobile Access Testing

Create this file as `mobile_test.html` and open from mobile browser:
```html
<!DOCTY html>
<html><head><title>MediPOS Mobile Test</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
</head><body style="font-family:Arial; padding:20px;">
<h2>🏥 MediPOS Mobile Test</h2>
<button onclick="test()" style="padding:10px 20px; font-size:16px;">Test Connection</button>
<div id="result" style="margin-top:20px;"></div>
<script>
async function test() {
    const ip = prompt("Enter your PC's IP address:", "192.168.1.100");
    try {
        const r = await fetch(`http://${ip}:8001/api/health`);
        const d = await r.json();
        document.getElementById('result').innerHTML = 
            `<p style="color:green;">✅ SUCCESS! MediPOS is accessible.<br>
            Open: <a href="http://${ip}:3000">http://${ip}:3000</a></p>`;
    } catch(e) {
        document.getElementById('result').innerHTML = 
            `<p style="color:red;">❌ Cannot connect: ${e.message}</p>`;
    }
}
</script></body></html>
```

Your MediPOS system is ready for Windows deployment! 🚀🪟
# 🪟 MediPOS Complete Windows Installation Guide

## 🎯 **One-Click Installation Process**

Your MediPOS Windows package now includes **automated prerequisites installation**! Follow these simple steps:

### **📦 Step 1: Download & Extract**
1. Download: `MediPOS_Windows_Complete.tar.gz`
2. Extract using 7-Zip or Windows built-in tools
3. Open the extracted `medipos_windows_package` folder

### **🚀 Step 2: Install Prerequisites (One-Click)**
**Double-click: `INSTALL_PREREQUISITES.bat`**

Choose your installation method:
- **PowerShell (Recommended)**: Advanced installer with progress bars and better error handling
- **Batch Script**: Simple installer compatible with older Windows versions
- **Manual**: Get download links if you prefer manual installation

**What gets installed automatically:**
- ✅ Python 3.11 (with PATH configuration)
- ✅ Node.js 20 LTS (with npm and yarn)
- ✅ MongoDB Community 7.0 (as Windows service)
- ✅ Git for Windows (version control)
- ✅ 7-Zip (for archive extraction)

### **🔧 Step 3: Configure Application**
**Double-click: `setup_windows.bat`**
- Automatically detects your network IP
- Updates configuration files
- Installs application dependencies
- Configures Windows Firewall

### **🏥 Step 4: Start MediPOS**
**Double-click: `start_medipos.bat`**
- Starts backend and frontend automatically
- Opens application in your browser
- Shows network URLs for other devices

## 🌐 **Access Your Application**

### **From Your Computer:**
- **URL**: `http://localhost:3000`
- **Login**: `admin` / `admin123`

### **From Mobile/Tablet/Other Computers:**
1. Connect devices to same WiFi network
2. Use your IP address: `http://YOUR_IP:3000`
3. **Login**: `admin` / `admin123`

## 📱 **Mobile Device Setup**

### **iPhone/iPad:**
1. Connect to same WiFi as your computer
2. Open Safari browser
3. Go to: `http://YOUR_IP:3000` (replace YOUR_IP with actual IP)
4. Add to Home Screen for app-like experience

### **Android Phone/Tablet:**
1. Connect to same WiFi network
2. Open Chrome browser
3. Navigate to: `http://YOUR_IP:3000`
4. Use "Add to Home screen" for quick access

## 🛠️ **Available Batch Files**

### **Installation & Setup:**
- **`INSTALL_PREREQUISITES.bat`** - One-click prerequisites installer
- **`check_system.bat`** - Verify system requirements
- **`setup_windows.bat`** - Configure application for your network

### **Application Management:**
- **`start_medipos.bat`** - Start complete application (recommended)
- **`start_backend.bat`** - Start backend server only
- **`start_frontend.bat`** - Start frontend application only

### **Advanced Scripts:**
- **`install_prerequisites.ps1`** - PowerShell version with advanced features
- **`install_prerequisites.bat`** - Batch version for older systems

## 🔧 **Troubleshooting Made Easy**

### **Prerequisites Issues:**
- **Run**: `check_system.bat` to verify all requirements
- **If missing**: Run `INSTALL_PREREQUISITES.bat` again
- **Manual links**: Available in the script if automation fails

### **Network Access Issues:**
- **Check Firewall**: `setup_windows.bat` configures automatically
- **Find your IP**: `ipconfig` in Command Prompt
- **Test connection**: Use mobile browser to test `http://YOUR_IP:8001/api/health`

### **Service Issues:**
```cmd
# MongoDB not running:
net start MongoDB

# Check if ports are available:
netstat -an | find "3000"
netstat -an | find "8001"
```

## 🏥 **MediPOS Features**

### **Complete Pharmacy Management:**
- 💊 **Medicine Inventory**: Stock tracking, expiry alerts, automated reordering
- 👤 **Patient Records**: Complete patient information with history
- 💰 **Sales & POS**: Fast transaction processing with receipt printing
- 👨‍⚕️ **Doctor Management**: Doctor profiles with digital signatures
- 📋 **OPD Prescriptions**: Digital prescription creation and printing
- 📊 **Analytics**: Sales reports, inventory analysis, profit tracking
- ⚙️ **User Management**: Role-based access (Admin/Manager/Staff)

### **Multi-Device Capabilities:**
- 📱 **Mobile Responsive**: Works perfectly on phones and tablets
- 🖥️ **Desktop Experience**: Full-featured desktop interface
- 🔄 **Real-time Sync**: All devices stay synchronized
- 🖨️ **Network Printing**: Print from any device to any printer

## 🔐 **Security & User Management**

### **Default Credentials:**
- **Username**: `admin`
- **Password**: `admin123`
- **⚠️ CRITICAL**: Change password immediately after first login!

### **User Roles:**
- **Admin**: Full system access, user management, settings
- **Manager**: Most operations, limited user management
- **Staff**: Basic operations, sales, patient management

### **Network Security:**
- CORS properly configured for local network
- JWT-based authentication
- MongoDB secure localhost-only access
- Windows Firewall integration

## 📊 **Business Benefits**

### **Efficiency Improvements:**
- ⚡ **Fast Sales Processing**: Barcode scanning, quick search
- 📈 **Inventory Management**: Automated stock tracking
- 🏥 **Patient Care**: Complete medical history access
- 📋 **Digital Prescriptions**: Reduce paper waste

### **Business Intelligence:**
- 💹 **Sales Analytics**: Revenue tracking, profit margins
- 📊 **Inventory Reports**: Best-selling items, slow movers
- 👥 **Customer Insights**: Patient visit patterns
- 🎯 **Performance Metrics**: Staff productivity, peak hours

## 🚀 **Getting Started Checklist**

### **Installation Steps:**
- [ ] Download MediPOS_Windows_Complete.tar.gz
- [ ] Extract to desired location
- [ ] Run `INSTALL_PREREQUISITES.bat`
- [ ] Run `setup_windows.bat`
- [ ] Run `start_medipos.bat`

### **Configuration Steps:**
- [ ] Access `http://localhost:3000`
- [ ] Login with admin/admin123
- [ ] Change default password
- [ ] Add your pharmacy information
- [ ] Create user accounts for staff
- [ ] Configure printer settings

### **Network Setup:**
- [ ] Test access from mobile device
- [ ] Add medicines to inventory
- [ ] Register patient information
- [ ] Process test sale transaction
- [ ] Print test receipt

## 📞 **Support & Resources**

### **Documentation Files:**
- `WINDOWS_SETUP_GUIDE.md` - Detailed technical setup
- `NETWORK_ACCESS_GUIDE.md` - Multi-device access guide
- `ARCHIVE_README.md` - Package contents and structure

### **Quick Commands:**
```cmd
# Check installations:
python --version
node --version
net start MongoDB

# Find your network IP:
ipconfig | findstr IPv4

# Test API connectivity:
curl http://localhost:8001/api/health
```

### **Common Solutions:**
- **"Python not recognized"**: Restart Command Prompt or computer
- **"MongoDB connection failed"**: Run `net start MongoDB`
- **"Can't access from phone"**: Check Windows Firewall settings
- **"Port already in use"**: Close other applications or restart computer

## 🎉 **Success Indicators**

**Your installation is successful when:**
- ✅ All batch files run without errors
- ✅ Application opens at `http://localhost:3000`
- ✅ Login works with admin/admin123
- ✅ Dashboard shows pharmacy management interface
- ✅ Mobile devices can access via network IP
- ✅ All features (medicines, patients, sales) work correctly

## 🌟 **Pro Tips**

### **Performance Optimization:**
- **Add MediPOS folder to Windows Defender exclusions**
- **Use SSD storage for better database performance**
- **Ensure adequate RAM (4GB+ recommended)**

### **Backup Strategy:**
- **MongoDB data**: Automatically backed up to `C:\data\db`
- **Application settings**: Stored in database
- **Regular exports**: Use built-in export features

### **Network Optimization:**
- **Use 5GHz WiFi for better performance**
- **Position devices close to router**
- **Consider Ethernet for main computer**

Your MediPOS pharmacy management system is now ready for professional use! 🏥🚀

**Need help? All troubleshooting information is included in the documentation files, and the automated scripts handle most common issues automatically.**
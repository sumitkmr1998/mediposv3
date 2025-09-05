# 📦 MediPOS Application Archive

## 🎯 Archive Contents
This archive contains the complete MediPOS (Medical Point of Sale) pharmacy management system with reverse proxy configuration for multi-device network access.

## 📋 What's Included

### 🏗️ Application Structure:
```
app/
├── backend/                    # FastAPI Backend
│   ├── server.py              # Main server application
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Backend configuration (with reverse proxy settings)
├── frontend/                   # React Frontend
│   ├── src/                   # Source code
│   ├── public/                # Static assets
│   ├── package.json           # Node.js dependencies
│   └── .env                   # Frontend configuration (with network IP)
├── test_result.md             # Implementation details & test results
├── NETWORK_ACCESS_GUIDE.md    # User guide for multi-device access
├── network_test.html          # Network connectivity test page
└── ARCHIVE_README.md          # This file
```

### 🔧 Configuration Files:
- **Backend .env**: Configured for `0.0.0.0:8001` binding with CORS support
- **Frontend .env**: Configured to use network IP `10.211.1.200:3000`
- **Database**: MongoDB connection configured for local access

## 🚀 Installation Instructions

### 1. Extract Archive:
```bash
tar -xzf MediPOS_with_ReverseProxy.tar.gz
cd app/
```

### 2. Install Backend Dependencies:
```bash
cd backend/
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies:
```bash
cd ../frontend/
yarn install
# or npm install
```

### 4. Update Network Configuration:
Edit the following files to match your network setup:

**Frontend (.env):**
```env
REACT_APP_BACKEND_URL=http://YOUR_SERVER_IP:8001
```

**Backend (.env):**
```env
CORS_ORIGINS=http://localhost:3000,http://YOUR_SERVER_IP:3000,http://127.0.0.1:3000
```

### 5. Start Services:

**Option A - Manual Start:**
```bash
# Terminal 1 - Start MongoDB (if not running)
mongod

# Terminal 2 - Start Backend
cd backend/
python server.py

# Terminal 3 - Start Frontend
cd frontend/
yarn start
```

**Option B - Using Supervisor (Recommended):**
- Copy supervisor configuration files
- Start with: `sudo supervisorctl start all`

## 🌐 Network Access Configuration

### 🔧 Current Settings:
- **Server IP**: `10.211.1.200` (update to your actual IP)
- **Frontend**: Port 3000
- **Backend API**: Port 8001
- **Database**: MongoDB on localhost:27017

### 📱 Multi-Device Access:
1. Connect devices to same WiFi network
2. Access: `http://YOUR_SERVER_IP:3000`
3. Login: `admin` / `admin123`

## 🏥 Features Included

### 💊 Core Modules:
- **Medicine Management**: Inventory tracking, stock alerts
- **Patient Records**: Complete patient information system  
- **Sales/POS**: Transaction processing with receipts
- **Doctor Management**: Doctor profiles and digital signatures
- **OPD Prescriptions**: Digital prescription creation
- **Analytics**: Comprehensive reporting and insights
- **User Management**: Role-based access control

### 🔐 Security Features:
- JWT-based authentication
- Role-based permissions (Admin/Manager/Staff)
- CORS protection
- Secure password hashing

### 📊 Advanced Features:
- Real-time inventory updates
- Multi-user synchronization
- Mobile-responsive interface
- Automated backup capabilities
- Custom receipt templates

## 🛠️ Technical Stack

### Backend:
- **Framework**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT tokens
- **Password**: bcrypt hashing

### Frontend:
- **Framework**: React 18+
- **UI Library**: Radix UI + Tailwind CSS
- **State Management**: React Context
- **HTTP Client**: Axios
- **Routing**: React Router

## 📞 Support & Documentation

### 📚 Documentation Files:
- `test_result.md` - Technical implementation details
- `NETWORK_ACCESS_GUIDE.md` - User guide for network access
- `network_test.html` - Connectivity testing tool

### 🔐 Default Credentials:
- **Username**: `admin`
- **Password**: `admin123`
- **⚠️ Important**: Change password after first login!

### 🔧 API Documentation:
- Available at: `http://YOUR_SERVER_IP:8001/docs`
- Interactive Swagger interface

## 📄 License & Notes

This is a complete pharmacy management system configured for multi-device network access. The reverse proxy configuration allows access from mobile devices, tablets, and computers on the same local network.

**Archive Created**: September 5, 2025
**Version**: MediPOS with Reverse Proxy Configuration
**Size**: ~71MB (excluding node_modules)

## 🚨 Important Notes

1. **Update IP Addresses**: Change `10.211.1.200` to your actual server IP
2. **Change Default Password**: Update admin credentials on first login
3. **MongoDB**: Ensure MongoDB is installed and running
4. **Firewall**: Open ports 3000 and 8001 for network access
5. **Node.js**: Requires Node.js 16+ for frontend
6. **Python**: Requires Python 3.8+ for backend

Your MediPOS system is ready for deployment! 🚀
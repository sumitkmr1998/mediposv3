# 🌐 MediPOS Network Access Guide

## 🎯 Overview
Your MediPOS system is now configured with reverse proxy support for multi-device access on your local network. You can access the pharmacy management system from any device connected to the same WiFi network.

## 📱 Access Information

### 🖥️ Main Application
- **URL**: `http://10.211.1.200:3000`
- **Default Login**: 
  - Username: `admin`
  - Password: `admin123`

### 🔧 API Endpoint
- **Backend API**: `http://10.211.1.200:8001/api`
- **Health Check**: `http://10.211.1.200:8001/api/health`

### 🧪 Network Test Page
- **Test URL**: `http://10.211.1.200:3000/network_test.html` *(if served from frontend)*
- Or open the `/app/network_test.html` file directly in a browser

## 📋 Device Setup Instructions

### For Mobile Devices (iOS/Android):
1. Connect to the same WiFi network as the server
2. Open your mobile browser (Safari, Chrome, etc.)
3. Navigate to: `http://10.211.1.200:3000`
4. Login with: `admin` / `admin123`
5. The interface is responsive and mobile-friendly

### For Tablets:
1. Connect to the same WiFi network
2. Open any web browser
3. Go to: `http://10.211.1.200:3000`
4. Enjoy the larger screen experience

### For Other Computers:
1. Ensure they're on the same network
2. Open any modern web browser
3. Access: `http://10.211.1.200:3000`
4. Full desktop experience available

## 🔧 Technical Configuration

### Network Settings:
- **Server IP**: `10.211.1.200`
- **Frontend Port**: `3000`
- **Backend Port**: `8001`
- **Database**: MongoDB (localhost only - secure)

### CORS Configuration:
- Allows access from: `localhost:3000`, `10.211.1.200:3000`, `127.0.0.1:3000`
- Supports all HTTP methods and headers
- Credentials enabled for authentication

### Security:
- Backend binds to `0.0.0.0` for network access
- CORS restricted to specific origins
- JWT-based authentication
- MongoDB accessible only locally

## 🚀 Features Available on All Devices

### 💊 Core Modules:
- **Medicine Management**: Add, edit, view medicine inventory
- **Patient Records**: Manage patient information and history
- **Sales/POS**: Process sales transactions with receipt printing
- **Doctor Management**: Maintain doctor profiles and signatures

### 📋 Advanced Features:
- **OPD Prescriptions**: Digital prescription creation and printing
- **Analytics**: Sales reports, inventory analysis, revenue tracking
- **User Management**: Role-based access control (Admin feature)
- **Settings**: System configuration and customization

### 📊 Real-time Data:
- Live inventory updates
- Real-time sales tracking
- Multi-user synchronization
- Automated low-stock alerts

## 🔐 User Roles & Permissions

### Admin (`admin`/`admin123`):
- Full system access
- User management
- System settings
- All CRUD operations

### Manager Role:
- Most operations except user management
- Limited delete permissions
- Analytics access

### Staff Role:
- Basic operations
- Sales processing
- Patient management
- Limited analytics

## 🛠️ Troubleshooting

### If You Can't Access from Another Device:

1. **Check Network Connection**:
   - Ensure both devices are on the same WiFi
   - Try accessing `http://10.211.1.200:3000` from the server first

2. **Firewall Issues**:
   - Server firewall might be blocking external connections
   - Check if ports 3000 and 8001 are open

3. **IP Address Changes**:
   - If server IP changes, update the frontend `.env` file
   - Restart services: `sudo supervisorctl restart all`

4. **Browser Issues**:
   - Clear browser cache
   - Try different browser
   - Disable browser extensions

### Service Management:
```bash
# Check service status
sudo supervisorctl status

# Restart all services
sudo supervisorctl restart all

# Check logs
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/frontend.err.log
```

## 📞 Support

### Default Credentials:
- **Username**: `admin`
- **Password**: `admin123`
- **⚠️ Important**: Change the default password after first login!

### API Documentation:
- Available at: `http://10.211.1.200:8001/docs`
- Interactive API testing interface

## 🎉 Success Indicators

✅ **Working Correctly When**:
- You can access `http://10.211.1.200:3000` from any device
- Login works with admin/admin123
- Dashboard loads with pharmacy data
- Mobile devices show responsive interface
- API calls work from different devices

Your MediPOS system is now ready for multi-device access across your local network! 🚀
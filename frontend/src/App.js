import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SettingsProvider } from "./contexts/SettingsContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Dashboard from "./components/Dashboard.jsx";
import MedicineManagement from "./components/MedicineManagement.jsx";
import PatientManagement from "./components/PatientManagement.jsx";
import SalesManagement from "./components/SalesManagement.jsx";
import DoctorManagement from "./components/DoctorManagement.jsx";
import OPDManagement from "./components/OPDManagement.jsx";
import POSInterface from "./components/POSInterface.jsx";
import OPDPrescriptionPrint from "./components/OPDPrescriptionPrint.jsx";
import Settings from "./components/Settings.jsx";
import SettingsTest from "./components/SettingsTest.jsx";
import Analytics from "./components/Analytics.jsx";
import UserManagement from "./components/UserManagement.jsx";
import Login from "./components/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";

// Main App Content Component
const AppContent = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Routes>
      {/* Print route without layout */}
      <Route path="/opd-prescription-print/:prescriptionId" element={<OPDPrescriptionPrint />} />
      
      {/* Main application routes with layout */}
      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/medicines" element={<MedicineManagement />} />
            <Route path="/patients" element={<PatientManagement />} />
            <Route path="/sales" element={<SalesManagement />} />
            <Route path="/pos" element={<POSInterface />} />
            <Route path="/doctors" element={<DoctorManagement />} />
            <Route path="/opd" element={<OPDManagement />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings-test" element={<SettingsTest />} />
            <Route 
              path="/users" 
              element={
                <ProtectedRoute requiredRoles={['admin', 'manager']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      } />
    </Routes>
  );
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <SettingsProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </SettingsProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
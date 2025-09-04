import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create Settings Context
const SettingsContext = createContext();

// Default settings structure
const DEFAULT_SETTINGS = {
  general: {
    shop_name: "MediPOS Pharmacy",
    shop_address: "123 Main Street, City, State, ZIP",
    shop_phone: "+1-234-567-8900",
    shop_email: "info@medipos.com",
    shop_license: "PH-2024-001",
    owner_name: "Pharmacy Owner",
    gst_number: "",
    currency: "USD",
    currency_symbol: "$",
    default_tax_rate: 10.0,
    timezone: "UTC",
    date_format: "YYYY-MM-DD",
    time_format: "24",
    decimal_places: 2,
    language: "English",
    backup_frequency: "daily",
    auto_backup: true,
    system_version: "1.0.0",
    last_backup: null
  },
  opd_paper: {
    paper_size: "A4",
    margin_top: 20,
    margin_bottom: 20,
    margin_left: 20,
    margin_right: 20,
    header_height: 80,
    footer_height: 60,
    line_height: 24,
    font_size: 12,
    font_family: "Arial",
    show_logo: true,
    logo_position: "left",
    clinic_name_size: 18,
    doctor_name_size: 14,
    patient_info_size: 12,
    prescription_area_lines: 15,
    show_medical_history: true,
    show_emergency_contact: false,
    watermark_text: "",
    print_instructions: "Please follow doctor's instructions carefully",
    custom_html_enabled: false,
    custom_html: `<!DOCTYPE html>
<html>
<head>
    <title>OPD Prescription</title>
    <style>
        /* Default styles will be merged with custom CSS */
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .clinic-name { font-size: 24px; font-weight: bold; }
        .doctor-info { margin: 20px 0; }
        .patient-info { margin: 20px 0; }
        .prescription-area { min-height: 300px; border: 1px solid #ccc; padding: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="clinic-name">{{clinic_name}}</div>
        <div class="clinic-address">{{clinic_address}}</div>
    </div>
    
    <div class="doctor-info">
        <strong>Dr. {{doctor_name}}</strong><br>
        {{doctor_specialization}}<br>
        {{doctor_qualification}}<br>
        License: {{doctor_license}}
    </div>
    
    <div class="patient-info">
        <strong>Patient:</strong> {{patient_name}}<br>
        <strong>Date:</strong> {{prescription_date}}<br>
        <strong>Age:</strong> {{patient_age}} | <strong>Gender:</strong> {{patient_gender}}
    </div>
    
    <div class="prescription-area">
        <strong>Rx</strong><br><br>
        {{prescription_notes}}
    </div>
    
    <div class="footer">
        <p>{{print_instructions}}</p>
        <br>
        <p>Doctor's Signature: _________________</p>
    </div>
</body>
</html>`,
    custom_css: `/* Custom CSS for OPD Prescription */
.header {
    border-bottom: 2px solid #333;
    padding-bottom: 15px;
}

.clinic-name {
    color: #2c5282;
    margin-bottom: 5px;
}

.doctor-info {
    background-color: #f7fafc;
    padding: 15px;
    border-left: 4px solid #4299e1;
}

.patient-info {
    background-color: #f0fff4;
    padding: 15px;
    border-left: 4px solid #48bb78;
}

.prescription-area {
    background-color: #fffaf0;
    border-radius: 8px;
    margin: 20px 0;
}

.footer {
    margin-top: 40px;
    text-align: center;
    font-size: 12px;
    color: #666;
}`
  },
  printer: {
    default_printer: "",
    receipt_width: 80,
    receipt_font_size: 10,
    receipt_line_spacing: 1.2,
    auto_print_receipts: false,
    auto_print_prescriptions: false,
    print_copies: 1,
    paper_cutting: true,
    cash_drawer: false,
    barcode_format: "CODE128",
    receipt_header: "MediPOS Pharmacy",
    receipt_footer: "Thank you for your business!",
    thermal_printer: false,
    print_quality: "normal"
  },
  telegram: {
    enabled: false,
    bot_token: "",
    chat_id: "",
    daily_report_time: "18:00",
    include_revenue: true,
    include_transactions: true,
    include_top_medicines: true,
    include_low_stock: true,
    include_patient_count: true,
    report_format: "detailed",
    timezone: "UTC"
  },
  alerts: {
    low_stock_enabled: true,
    low_stock_threshold: 10,
    low_stock_check_frequency: "daily",
    low_stock_notification_time: "09:00",
    expiry_alert_enabled: true,
    expiry_alert_days: 30,
    expiry_check_frequency: "daily",
    expiry_notification_time: "09:30",
    telegram_alerts: false,
    email_alerts: false,
    system_notifications: true,
    sound_notifications: false
  }
};

// Settings Provider Component
export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch settings from API
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/settings`);
      setSettings({ ...DEFAULT_SETTINGS, ...response.data });
      setError(null);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setError(error.message);
      // Use default settings if fetch fails
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  // Save settings to API
  const saveSettings = async (newSettings) => {
    try {
      await axios.post(`${API}/settings`, newSettings);
      setSettings({ ...settings, ...newSettings });
      return { success: true };
    } catch (error) {
      console.error("Error saving settings:", error);
      return { success: false, error: error.message };
    }
  };

  // Update a specific setting
  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  // Initialize settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const contextValue = {
    settings,
    loading,
    error,
    fetchSettings,
    saveSettings,
    updateSetting,
    // Quick access to commonly used settings
    currency: settings.general.currency_symbol,
    taxRate: settings.general.default_tax_rate,
    decimalPlaces: settings.general.decimal_places,
    dateFormat: settings.general.date_format,
    timeFormat: settings.general.time_format,
    timezone: settings.general.timezone,
    shopName: settings.general.shop_name,
    shopAddress: settings.general.shop_address,
    shopPhone: settings.general.shop_phone,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use settings
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;
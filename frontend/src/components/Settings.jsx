import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useSettings } from "../contexts/SettingsContext";
import OPDPaperSettings from "./OPDPaperSettings";
import { 
  Settings as SettingsIcon,
  FileText,
  Printer,
  MessageSquare,
  AlertTriangle,
  Calendar,
  Save,
  TestTube,
  Bell,
  Send,
  Clock,
  Package,
  Stethoscope,
  Palette,
  Layout,
  CheckCircle,
  XCircle,
  Globe,
  Store,
  Server,
  Activity,
  Database,
  Cpu,
  HardDrive,
  MemoryStick,
  Monitor,
  RefreshCw,
  Info,
  Download,
  Upload,
  Archive,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FolderOpen,
  History
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Settings = () => {
  const { 
    settings, 
    loading: contextLoading, 
    updateSetting, 
    saveSettings: contextSaveSettings
  } = useSettings();
  
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState(false);
  const [verifyingBackup, setVerifyingBackup] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  
  // XLS Export/Import states
  const [exportSelections, setExportSelections] = useState({
    medicines: true,
    patients: true,
    sales: false,
    doctors: true,
    opd_prescriptions: false,
    returns: false,
    settings: false,
    all: false
  });
  const [exportingXLS, setExportingXLS] = useState(false);
  const [importingXLS, setImportingXLS] = useState(false);
  const [lastImportResult, setLastImportResult] = useState(null);
  const xlsFileInputRef = useRef(null);

  useEffect(() => {
    fetchSystemStatus();
    fetchBackups();
  }, []);

  const fetchSystemStatus = async () => {
    setLoadingStatus(true);
    try {
      const response = await axios.get(`${API}/system-status`);
      setSystemStatus(response.data);
    } catch (error) {
      console.error("Error fetching system status:", error);
      setSystemStatus({ status: "error", error: "Failed to fetch system status" });
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchBackups = async () => {
    setLoadingBackups(true);
    try {
      const response = await axios.get(`${API}/backup/list`);
      setBackups(response.data);
    } catch (error) {
      console.error("Error fetching backups:", error);
      setBackups([]);
    } finally {
      setLoadingBackups(false);
    }
  };

  const createBackup = async () => {
    setCreatingBackup(true);
    try {
      const backupData = {
        name: `Manual Backup ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        description: "Manual backup created from settings",
        include_database: true,
        include_settings: true,
        include_app_files: false,
        create_archive: true
      };
      
      const response = await axios.post(`${API}/backup/create`, backupData);
      
      if (response.data.success) {
        alert("✅ Backup created successfully!");
        await fetchBackups();
      } else {
        alert("❌ Backup creation failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Error creating backup:", error);
      alert("❌ Backup creation failed: " + (error.response?.data?.detail || "Unknown error"));
    } finally {
      setCreatingBackup(false);
    }
  };

  const restoreBackup = async (backupId, force = false) => {
    setRestoringBackup(true);
    try {
      const restoreData = {
        backup_id: backupId,
        restore_database: true,
        restore_settings: true,
        force_restore: force
      };
      
      const response = await axios.post(`${API}/backup/restore`, restoreData);
      
      if (response.data.success) {
        alert("✅ Backup restored successfully! The application will refresh.");
        // Refresh the page to load restored settings
        window.location.reload();
      } else {
        alert("❌ Backup restore failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Error restoring backup:", error);
      alert("❌ Backup restore failed: " + (error.response?.data?.detail || "Unknown error"));
    } finally {
      setRestoringBackup(false);
      setShowRestoreConfirm(false);
      setSelectedBackup(null);
    }
  };

  const verifyBackup = async (backupId) => {
    setVerifyingBackup(true);
    try {
      const response = await axios.get(`${API}/backup/${backupId}/verify`);
      
      if (response.data.success) {
        alert("✅ Backup verification successful!");
      } else {
        alert("❌ Backup verification failed: " + response.data.error);
      }
    } catch (error) {
      console.error("Error verifying backup:", error);
      alert("❌ Backup verification failed: " + (error.response?.data?.detail || "Unknown error"));
    } finally {
      setVerifyingBackup(false);
    }
  };

  const deleteBackup = async (backupId, backupName) => {
    if (!window.confirm(`Are you sure you want to delete the backup "${backupName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await axios.delete(`${API}/backup/${backupId}`);
      
      if (response.data.success) {
        alert("✅ Backup deleted successfully!");
        await fetchBackups();
      } else {
        alert("❌ Backup deletion failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Error deleting backup:", error);
      alert("❌ Backup deletion failed: " + (error.response?.data?.detail || "Unknown error"));
    }
  };

  const cleanupOldBackups = async () => {
    if (!window.confirm("Are you sure you want to delete backups older than 30 days? This action cannot be undone.")) {
      return;
    }
    
    try {
      const response = await axios.post(`${API}/backup/cleanup`, {}, { params: { days_to_keep: 30 } });
      
      if (response.data.success) {
        alert(`✅ Cleanup completed! Deleted ${response.data.deleted_count} old backups.`);
        await fetchBackups();
      } else {
        alert("❌ Cleanup failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
      alert("❌ Cleanup failed: " + (error.response?.data?.detail || "Unknown error"));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await contextSaveSettings(settings);
      if (result.success) {
        alert("Settings saved successfully!");
      } else {
        alert("Error saving settings: " + result.error);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const testTelegramConnection = async () => {
    setTestingConnection(true);
    try {
      const response = await axios.post(`${API}/test-telegram`, {
        bot_token: settings.telegram.bot_token,
        chat_id: settings.telegram.chat_id
      });
      
      if (response.data.success) {
        alert("✅ Telegram connection successful! Test message sent.");
      } else {
        alert("❌ Telegram connection failed: " + response.data.error);
      }
    } catch (error) {
      console.error("Error testing telegram:", error);
      alert("❌ Telegram test failed: " + (error.response?.data?.detail || "Unknown error"));
    } finally {
      setTestingConnection(false);
    }
  };

  const sendTestDailyReport = async () => {
    try {
      await axios.post(`${API}/send-test-daily-report`);
      alert("✅ Test daily report sent successfully!");
    } catch (error) {
      console.error("Error sending test report:", error);
      alert("❌ Error sending test report: " + (error.response?.data?.detail || "Unknown error"));
    }
  };

  // XLS Export/Import Functions
  const exportToXLS = async () => {
    setExportingXLS(true);
    try {
      const selectedCollections = Object.keys(exportSelections)
        .filter(key => key !== 'all' && exportSelections[key]);
      
      if (selectedCollections.length === 0) {
        alert("Please select at least one data type to export");
        return;
      }
      
      const exportData = {
        collections: selectedCollections,
        include_system_data: exportSelections.settings
      };
      
      const response = await axios.post(`${API}/export/xls`, exportData, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'medipos_export.xlsx';
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert(`✅ Excel export completed successfully!
      
📊 Exported data: ${selectedCollections.join(', ')}
📁 File: ${filename}`);
      
    } catch (error) {
      console.error("Error exporting to XLS:", error);
      alert("❌ Export failed: " + (error.response?.data?.detail || error.message));
    } finally {
      setExportingXLS(false);
    }
  };
  
  const handleXLSImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setImportingXLS(true);
    setLastImportResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API}/import/xls`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setLastImportResult(response.data);
      
      if (response.data.success) {
        alert(`✅ Excel import completed successfully!
        
📊 Imported:
${Object.entries(response.data.imported_counts || {})
  .map(([type, count]) => `• ${type}: ${count} records`)
  .join('\n')}

⚠️ ${response.data.warnings?.length || 0} warnings
❌ ${response.data.errors?.length || 0} errors`);
      } else {
        alert(`❌ Import completed with errors:
        
${response.data.errors?.slice(0, 3).join('\n') || 'Unknown error'}
${response.data.errors?.length > 3 ? `\n... and ${response.data.errors.length - 3} more errors` : ''}`);
      }
      
    } catch (error) {
      console.error("Error importing XLS:", error);
      const errorMessage = error.response?.data?.detail || error.message;
      setLastImportResult({
        success: false,
        message: errorMessage,
        errors: [errorMessage]
      });
      alert("❌ Import failed: " + errorMessage);
    } finally {
      setImportingXLS(false);
      // Clear the input so the same file can be selected again
      event.target.value = '';
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (contextLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
        <Button onClick={handleSave} disabled={saving} className="flex items-center">
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center">
            <Store className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="opd-paper" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            OPD Paper
          </TabsTrigger>
          <TabsTrigger value="printer" className="flex items-center">
            <Printer className="mr-2 h-4 w-4" />
            Printer
          </TabsTrigger>
          <TabsTrigger value="telegram" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            Telegram
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center">
            <Archive className="mr-2 h-4 w-4" />
            Backup
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general">
          <div className="grid gap-6">
            {/* Shop Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="mr-2 h-5 w-5 text-blue-600" />
                  Shop Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="shop_name">Shop Name *</Label>
                  <Input
                    id="shop_name"
                    value={settings.general.shop_name}
                    onChange={(e) => updateSetting('general', 'shop_name', e.target.value)}
                    placeholder="Enter shop name"
                  />
                </div>

                <div>
                  <Label htmlFor="owner_name">Owner Name</Label>
                  <Input
                    id="owner_name"
                    value={settings.general.owner_name}
                    onChange={(e) => updateSetting('general', 'owner_name', e.target.value)}
                    placeholder="Enter owner name"
                  />
                </div>

                <div>
                  <Label htmlFor="shop_phone">Phone Number</Label>
                  <Input
                    id="shop_phone"
                    value={settings.general.shop_phone}
                    onChange={(e) => updateSetting('general', 'shop_phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="shop_address">Address</Label>
                  <Input
                    id="shop_address"
                    value={settings.general.shop_address}
                    onChange={(e) => updateSetting('general', 'shop_address', e.target.value)}
                    placeholder="Enter complete address"
                  />
                </div>

                <div>
                  <Label htmlFor="shop_email">Email</Label>
                  <Input
                    id="shop_email"
                    type="email"
                    value={settings.general.shop_email}
                    onChange={(e) => updateSetting('general', 'shop_email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <Label htmlFor="shop_license">License Number</Label>
                  <Input
                    id="shop_license"
                    value={settings.general.shop_license}
                    onChange={(e) => updateSetting('general', 'shop_license', e.target.value)}
                    placeholder="Enter license number"
                  />
                </div>

                <div>
                  <Label htmlFor="gst_number">GST Number</Label>
                  <Input
                    id="gst_number"
                    value={settings.general.gst_number}
                    onChange={(e) => updateSetting('general', 'gst_number', e.target.value)}
                    placeholder="Enter GST number"
                  />
                </div>
              </CardContent>
            </Card>

            {/* System Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="mr-2 h-5 w-5 text-green-600" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={settings.general.currency}
                    onChange={(e) => updateSetting('general', 'currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="currency_symbol">Currency Symbol</Label>
                  <Input
                    id="currency_symbol"
                    value={settings.general.currency_symbol}
                    onChange={(e) => updateSetting('general', 'currency_symbol', e.target.value)}
                    placeholder="Enter currency symbol"
                  />
                </div>

                <div>
                  <Label htmlFor="default_tax_rate">Default Tax Rate (%)</Label>
                  <Input
                    id="default_tax_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.general.default_tax_rate}
                    onChange={(e) => updateSetting('general', 'default_tax_rate', parseFloat(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="decimal_places">Decimal Places</Label>
                  <select
                    id="decimal_places"
                    value={settings.general.decimal_places}
                    onChange={(e) => updateSetting('general', 'decimal_places', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>0 (Whole numbers)</option>
                    <option value={1}>1 (0.0)</option>
                    <option value={2}>2 (0.00)</option>
                    <option value={3}>3 (0.000)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    value={settings.general.timezone}
                    onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Kolkata">India</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Australia/Sydney">Sydney</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="date_format">Date Format</Label>
                  <select
                    id="date_format"
                    value={settings.general.date_format}
                    onChange={(e) => updateSetting('general', 'date_format', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2024-01-15)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (15/01/2024)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (01/15/2024)</option>
                    <option value="DD-MM-YYYY">DD-MM-YYYY (15-01-2024)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="time_format">Time Format</Label>
                  <select
                    id="time_format"
                    value={settings.general.time_format}
                    onChange={(e) => updateSetting('general', 'time_format', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="24">24 Hour (14:30)</option>
                    <option value="12">12 Hour (2:30 PM)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <select
                    id="language"
                    value={settings.general.language}
                    onChange={(e) => updateSetting('general', 'language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="backup_frequency">Backup Frequency</Label>
                  <select
                    id="backup_frequency"
                    value={settings.general.backup_frequency}
                    onChange={(e) => updateSetting('general', 'backup_frequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="never">Never</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto_backup"
                    checked={settings.general.auto_backup}
                    onChange={(e) => updateSetting('general', 'auto_backup', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="auto_backup">Enable Automatic Backup</Label>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-purple-600" />
                    System Status
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchSystemStatus}
                    disabled={loadingStatus}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${loadingStatus ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStatus ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : systemStatus ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Overall Status */}
                    <div className="col-span-full mb-4">
                      <div className={`flex items-center p-4 rounded-lg ${
                        systemStatus.status === 'operational' 
                          ? 'bg-green-50 text-green-800' 
                          : 'bg-red-50 text-red-800'
                      }`}>
                        {systemStatus.status === 'operational' ? (
                          <CheckCircle className="mr-2 h-5 w-5" />
                        ) : (
                          <XCircle className="mr-2 h-5 w-5" />
                        )}
                        <span className="font-semibold">
                          System Status: {systemStatus.status === 'operational' ? 'Operational' : 'Error'}
                        </span>
                        <span className="ml-auto text-sm">
                          Last Updated: {new Date(systemStatus.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* CPU Information */}
                    {systemStatus.cpu && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center mb-2">
                            <Cpu className="mr-2 h-4 w-4 text-blue-600" />
                            <span className="font-semibold">CPU</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div>Usage: {systemStatus.cpu.percent}%</div>
                            <div>Cores: {systemStatus.cpu.count}</div>
                            {systemStatus.cpu.frequency && (
                              <div>Frequency: {Math.round(systemStatus.cpu.frequency.current)} MHz</div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Memory Information */}
                    {systemStatus.memory && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center mb-2">
                            <MemoryStick className="mr-2 h-4 w-4 text-green-600" />
                            <span className="font-semibold">Memory</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div>Usage: {systemStatus.memory.percent}%</div>
                            <div>Used: {formatBytes(systemStatus.memory.used)}</div>
                            <div>Free: {formatBytes(systemStatus.memory.available)}</div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Disk Information */}
                    {systemStatus.disk && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center mb-2">
                            <HardDrive className="mr-2 h-4 w-4 text-orange-600" />
                            <span className="font-semibold">Disk</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div>Usage: {systemStatus.disk.percent.toFixed(1)}%</div>
                            <div>Used: {formatBytes(systemStatus.disk.used)}</div>
                            <div>Free: {formatBytes(systemStatus.disk.free)}</div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Database Information */}
                    {systemStatus.database && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center mb-2">
                            <Database className="mr-2 h-4 w-4 text-purple-600" />
                            <span className="font-semibold">Database</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className={`flex items-center ${
                              systemStatus.database.status === 'Connected' 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {systemStatus.database.status === 'Connected' ? (
                                <CheckCircle className="mr-1 h-3 w-3" />
                              ) : (
                                <XCircle className="mr-1 h-3 w-3" />
                              )}
                              {systemStatus.database.status}
                            </div>
                            {systemStatus.database.collections && (
                              <div className="mt-2">
                                <div className="text-xs text-gray-600">Collections:</div>
                                {Object.entries(systemStatus.database.collections).map(([key, value]) => (
                                  <div key={key} className="text-xs">
                                    {key}: {value}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* System Information */}
                    {systemStatus.system && (
                      <Card className="md:col-span-2">
                        <CardContent className="p-4">
                          <div className="flex items-center mb-2">
                            <Monitor className="mr-2 h-4 w-4 text-gray-600" />
                            <span className="font-semibold">System Information</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>OS: {systemStatus.system.system}</div>
                            <div>Architecture: {systemStatus.system.architecture}</div>
                            <div>Python: {systemStatus.system.python_version}</div>
                            <div>Version: {settings.general.system_version}</div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Info className="mx-auto h-12 w-12 mb-4" />
                    <p>Click refresh to load system status</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* OPD Paper Configuration */}
        <TabsContent value="opd-paper">
          <OPDPaperSettings settings={settings} updateSetting={updateSetting} />
        </TabsContent>

        {/* Printer Configuration */}
        <TabsContent value="printer">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Printer className="mr-2 h-5 w-5 text-purple-600" />
                  Printer Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="default_printer">Default Printer</Label>
                  <Input
                    id="default_printer"
                    value={settings.printer.default_printer}
                    onChange={(e) => updateSetting('printer', 'default_printer', e.target.value)}
                    placeholder="Enter printer name"
                  />
                </div>

                <div>
                  <Label htmlFor="receipt_width">Receipt Width (mm)</Label>
                  <Input
                    id="receipt_width"
                    type="number"
                    min="58"
                    max="80"
                    value={settings.printer.receipt_width}
                    onChange={(e) => updateSetting('printer', 'receipt_width', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="receipt_font_size">Receipt Font Size</Label>
                  <Input
                    id="receipt_font_size"
                    type="number"
                    min="8"
                    max="14"
                    value={settings.printer.receipt_font_size}
                    onChange={(e) => updateSetting('printer', 'receipt_font_size', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="print_copies">Print Copies</Label>
                  <Input
                    id="print_copies"
                    type="number"
                    min="1"
                    max="5"
                    value={settings.printer.print_copies}
                    onChange={(e) => updateSetting('printer', 'print_copies', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="barcode_format">Barcode Format</Label>
                  <select
                    id="barcode_format"
                    value={settings.printer.barcode_format}
                    onChange={(e) => updateSetting('printer', 'barcode_format', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CODE128">CODE128</option>
                    <option value="CODE39">CODE39</option>
                    <option value="EAN13">EAN13</option>
                    <option value="UPC">UPC</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="print_quality">Print Quality</Label>
                  <select
                    id="print_quality"
                    value={settings.printer.print_quality}
                    onChange={(e) => updateSetting('printer', 'print_quality', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="receipt_header">Receipt Header</Label>
                  <Input
                    id="receipt_header"
                    value={settings.printer.receipt_header}
                    onChange={(e) => updateSetting('printer', 'receipt_header', e.target.value)}
                    placeholder="Header text for receipts"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="receipt_footer">Receipt Footer</Label>
                  <Input
                    id="receipt_footer"
                    value={settings.printer.receipt_footer}
                    onChange={(e) => updateSetting('printer', 'receipt_footer', e.target.value)}
                    placeholder="Footer text for receipts"
                  />
                </div>

                <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto_print_receipts"
                      checked={settings.printer.auto_print_receipts}
                      onChange={(e) => updateSetting('printer', 'auto_print_receipts', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="auto_print_receipts">Auto Print Receipts</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto_print_prescriptions"
                      checked={settings.printer.auto_print_prescriptions}
                      onChange={(e) => updateSetting('printer', 'auto_print_prescriptions', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="auto_print_prescriptions">Auto Print Prescriptions</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="thermal_printer"
                      checked={settings.printer.thermal_printer}
                      onChange={(e) => updateSetting('printer', 'thermal_printer', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="thermal_printer">Thermal Printer</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="cash_drawer"
                      checked={settings.printer.cash_drawer}
                      onChange={(e) => updateSetting('printer', 'cash_drawer', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="cash_drawer">Cash Drawer</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Telegram Configuration */}
        <TabsContent value="telegram">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
                  Telegram Bot Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="telegram_enabled"
                    checked={settings.telegram.enabled}
                    onChange={(e) => updateSetting('telegram', 'enabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="telegram_enabled" className="font-semibold">Enable Telegram Notifications</Label>
                </div>

                {settings.telegram.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bot_token">Bot Token</Label>
                      <Input
                        id="bot_token"
                        type="password"
                        value={settings.telegram.bot_token}
                        onChange={(e) => updateSetting('telegram', 'bot_token', e.target.value)}
                        placeholder="Enter bot token from @BotFather"
                      />
                    </div>

                    <div>
                      <Label htmlFor="chat_id">Chat ID</Label>
                      <Input
                        id="chat_id"
                        value={settings.telegram.chat_id}
                        onChange={(e) => updateSetting('telegram', 'chat_id', e.target.value)}
                        placeholder="Enter chat ID"
                      />
                    </div>

                    <div>
                      <Label htmlFor="daily_report_time">Daily Report Time</Label>
                      <Input
                        id="daily_report_time"
                        type="time"
                        value={settings.telegram.daily_report_time}
                        onChange={(e) => updateSetting('telegram', 'daily_report_time', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="report_format">Report Format</Label>
                      <select
                        id="report_format"
                        value={settings.telegram.report_format}
                        onChange={(e) => updateSetting('telegram', 'report_format', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="brief">Brief</option>
                        <option value="detailed">Detailed</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="include_revenue"
                          checked={settings.telegram.include_revenue}
                          onChange={(e) => updateSetting('telegram', 'include_revenue', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="include_revenue">Revenue</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="include_transactions"
                          checked={settings.telegram.include_transactions}
                          onChange={(e) => updateSetting('telegram', 'include_transactions', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="include_transactions">Transactions</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="include_top_medicines"
                          checked={settings.telegram.include_top_medicines}
                          onChange={(e) => updateSetting('telegram', 'include_top_medicines', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="include_top_medicines">Top Medicines</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="include_low_stock"
                          checked={settings.telegram.include_low_stock}
                          onChange={(e) => updateSetting('telegram', 'include_low_stock', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="include_low_stock">Low Stock</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="include_patient_count"
                          checked={settings.telegram.include_patient_count}
                          onChange={(e) => updateSetting('telegram', 'include_patient_count', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="include_patient_count">Patient Count</Label>
                      </div>
                    </div>

                    <div className="md:col-span-2 flex space-x-4">
                      <Button 
                        variant="outline" 
                        onClick={testTelegramConnection}
                        disabled={testingConnection || !settings.telegram.bot_token || !settings.telegram.chat_id}
                      >
                        <TestTube className="mr-2 h-4 w-4" />
                        {testingConnection ? "Testing..." : "Test Connection"}
                      </Button>

                      <Button 
                        variant="outline" 
                        onClick={sendTestDailyReport}
                        disabled={!settings.telegram.enabled || !settings.telegram.bot_token || !settings.telegram.chat_id}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Send Test Report
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Configuration */}
        <TabsContent value="alerts">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-red-600" />
                  Alert Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Low Stock Alerts */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      id="low_stock_enabled"
                      checked={settings.alerts.low_stock_enabled}
                      onChange={(e) => updateSetting('alerts', 'low_stock_enabled', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="low_stock_enabled" className="font-semibold">Low Stock Alerts</Label>
                  </div>

                  {settings.alerts.low_stock_enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="low_stock_threshold">Threshold Quantity</Label>
                        <Input
                          id="low_stock_threshold"
                          type="number"
                          min="1"
                          value={settings.alerts.low_stock_threshold}
                          onChange={(e) => updateSetting('alerts', 'low_stock_threshold', parseInt(e.target.value))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="low_stock_check_frequency">Check Frequency</Label>
                        <select
                          id="low_stock_check_frequency"
                          value={settings.alerts.low_stock_check_frequency}
                          onChange={(e) => updateSetting('alerts', 'low_stock_check_frequency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="low_stock_notification_time">Notification Time</Label>
                        <Input
                          id="low_stock_notification_time"
                          type="time"
                          value={settings.alerts.low_stock_notification_time}
                          onChange={(e) => updateSetting('alerts', 'low_stock_notification_time', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Expiry Alerts */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      id="expiry_alert_enabled"
                      checked={settings.alerts.expiry_alert_enabled}
                      onChange={(e) => updateSetting('alerts', 'expiry_alert_enabled', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="expiry_alert_enabled" className="font-semibold">Expiry Alerts</Label>
                  </div>

                  {settings.alerts.expiry_alert_enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="expiry_alert_days">Alert Days Before</Label>
                        <Input
                          id="expiry_alert_days"
                          type="number"
                          min="1"
                          max="365"
                          value={settings.alerts.expiry_alert_days}
                          onChange={(e) => updateSetting('alerts', 'expiry_alert_days', parseInt(e.target.value))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="expiry_check_frequency">Check Frequency</Label>
                        <select
                          id="expiry_check_frequency"
                          value={settings.alerts.expiry_check_frequency}
                          onChange={(e) => updateSetting('alerts', 'expiry_check_frequency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="expiry_notification_time">Notification Time</Label>
                        <Input
                          id="expiry_notification_time"
                          type="time"
                          value={settings.alerts.expiry_notification_time}
                          onChange={(e) => updateSetting('alerts', 'expiry_notification_time', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Notification Methods */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-4">Notification Methods</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="telegram_alerts"
                        checked={settings.alerts.telegram_alerts}
                        onChange={(e) => updateSetting('alerts', 'telegram_alerts', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="telegram_alerts">Telegram</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="email_alerts"
                        checked={settings.alerts.email_alerts}
                        onChange={(e) => updateSetting('alerts', 'email_alerts', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="email_alerts">Email</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="system_notifications"
                        checked={settings.alerts.system_notifications}
                        onChange={(e) => updateSetting('alerts', 'system_notifications', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="system_notifications">System</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="sound_notifications"
                        checked={settings.alerts.sound_notifications}
                        onChange={(e) => updateSetting('alerts', 'sound_notifications', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="sound_notifications">Sound</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Backup & Restore Configuration */}
        <TabsContent value="backup">
          <div className="grid gap-6">
            {/* Backup Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Archive className="mr-2 h-5 w-5 text-blue-600" />
                    Backup & Restore Management
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={createBackup} 
                      disabled={creatingBackup}
                      className="flex items-center"
                    >
                      {creatingBackup ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Archive className="mr-2 h-4 w-4" />
                      )}
                      {creatingBackup ? "Creating..." : "Create Backup"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={fetchBackups}
                      disabled={loadingBackups}
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${loadingBackups ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Shield className="mr-2 h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">Automatic Backup</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      {settings.general.auto_backup ? 'Enabled' : 'Disabled'} 
                      {settings.general.backup_frequency && settings.general.auto_backup && 
                        ` - ${settings.general.backup_frequency}`}
                    </p>
                    <p className="text-xs text-blue-500 mt-1">
                      Configure in General settings
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <FolderOpen className="mr-2 h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">Total Backups</span>
                    </div>
                    <p className="text-sm text-green-600">
                      {backups.length} backup{backups.length !== 1 ? 's' : ''} available
                    </p>
                    <p className="text-xs text-green-500 mt-1">
                      Storage used: {backups.reduce((total, backup) => total + (backup.file_size || 0), 0) > 0 ? 
                        formatBytes(backups.reduce((total, backup) => total + (backup.file_size || 0), 0)) : '0 B'}
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <History className="mr-2 h-5 w-5 text-orange-600" />
                      <span className="font-semibold text-orange-800">Last Backup</span>
                    </div>
                    <p className="text-sm text-orange-600">
                      {backups.length > 0 ? 
                        new Date(backups[0].created_at).toLocaleDateString() : 'No backups yet'}
                    </p>
                    <p className="text-xs text-orange-500 mt-1">
                      {settings.general.last_backup ? 
                        `System: ${new Date(settings.general.last_backup).toLocaleDateString()}` : 
                        'Create your first backup'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-800">Quick Actions</h3>
                    <p className="text-sm text-gray-600">Common backup and maintenance operations</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={cleanupOldBackups}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Cleanup Old
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.tar.gz,.json';
                        input.onchange = (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            alert("File upload feature coming soon!");
                          }
                        };
                        input.click();
                      }}
                    >
                      <Upload className="mr-1 h-3 w-3" />
                      Import
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* XLS Export/Import */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-green-600" />
                  Excel Export & Import
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {/* Export Section */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Export Data to Excel</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Export selected data collections to Excel format for analysis or backup
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {[
                        {key: "medicines", label: "Medicines", icon: "💊"},
                        {key: "patients", label: "Patients", icon: "👥"},
                        {key: "sales", label: "Sales", icon: "💰"},
                        {key: "doctors", label: "Doctors", icon: "👨‍⚕️"},
                        {key: "opd_prescriptions", label: "Prescriptions", icon: "📋"},
                        {key: "returns", label: "Returns", icon: "↩️"},
                        {key: "settings", label: "Settings", icon: "⚙️"},
                        {key: "all", label: "All Data", icon: "📊"}
                      ].map((item) => (
                        <div key={item.key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`export-${item.key}`}
                            checked={exportSelections[item.key] || false}
                            onChange={(e) => {
                              if (item.key === 'all') {
                                const newSelections = {};
                                Object.keys(exportSelections).forEach(key => {
                                  newSelections[key] = e.target.checked;
                                });
                                setExportSelections(newSelections);
                              } else {
                                setExportSelections({
                                  ...exportSelections,
                                  [item.key]: e.target.checked,
                                  all: false // Uncheck "all" when individual items are changed
                                });
                              }
                            }}
                            className="rounded"
                          />
                          <label htmlFor={`export-${item.key}`} className="text-sm flex items-center cursor-pointer">
                            <span className="mr-1">{item.icon}</span>
                            {item.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          onClick={exportToXLS}
                          disabled={exportingXLS || Object.values(exportSelections).every(v => !v)}
                          className="flex items-center"
                        >
                          {exportingXLS ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="mr-2 h-4 w-4" />
                          )}
                          {exportingXLS ? "Exporting..." : "Export to Excel"}
                        </Button>
                        
                        <div className="text-xs text-gray-500">
                          {Object.values(exportSelections).filter(Boolean).length} selected
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const allSelected = exportSelections.all;
                          const newSelections = {};
                          Object.keys(exportSelections).forEach(key => {
                            newSelections[key] = !allSelected;
                          });
                          setExportSelections(newSelections);
                        }}
                      >
                        {exportSelections.all ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Import Section */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Import Data from Excel</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Import data from Excel files. Data will be merged with existing records.
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <input
                          type="file"
                          ref={xlsFileInputRef}
                          accept=".xlsx,.xls"
                          onChange={handleXLSImport}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          onClick={() => xlsFileInputRef.current?.click()}
                          disabled={importingXLS}
                          className="flex items-center"
                        >
                          {importingXLS ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          {importingXLS ? "Importing..." : "Import from Excel"}
                        </Button>
                        
                        {lastImportResult && (
                          <div className={`text-xs px-2 py-1 rounded ${
                            lastImportResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {lastImportResult.success ? 
                              `✅ Imported ${Object.values(lastImportResult.imported_counts).reduce((a, b) => a + b, 0)} records` :
                              `❌ Import failed`
                            }
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          alert(`📋 Excel Import Format:
                          
Required sheets and columns:
• Medicines: ID, Name, Generic Name, Manufacturer, etc.
• Patients: ID, Name, Phone, Email, Address, etc.  
• Doctors: ID, Name, Specialization, Qualification, etc.

💡 Tips:
• Export existing data first to see the format
• Data will be merged (existing records updated)
• Invalid rows will be skipped with warnings`);
                        }}
                      >
                        <Info className="mr-1 h-3 w-3" />
                        Format Help
                      </Button>
                    </div>
                    
                    {lastImportResult && lastImportResult.errors?.length > 0 && (
                      <div className="mt-3 p-3 bg-red-50 rounded border-l-4 border-red-500">
                        <h5 className="text-sm font-semibold text-red-800 mb-2">Import Errors:</h5>
                        <ul className="text-xs text-red-600 space-y-1">
                          {lastImportResult.errors.slice(0, 5).map((error, idx) => (
                            <li key={idx}>• {error}</li>
                          ))}
                          {lastImportResult.errors.length > 5 && (
                            <li>... and {lastImportResult.errors.length - 5} more errors</li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    {lastImportResult && lastImportResult.warnings?.length > 0 && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
                        <h5 className="text-sm font-semibold text-yellow-800 mb-2">Import Warnings:</h5>
                        <ul className="text-xs text-yellow-600 space-y-1">
                          {lastImportResult.warnings.slice(0, 3).map((warning, idx) => (
                            <li key={idx}>• {warning}</li>
                          ))}
                          {lastImportResult.warnings.length > 3 && (
                            <li>... and {lastImportResult.warnings.length - 3} more warnings</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Backup History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="mr-2 h-5 w-5 text-purple-600" />
                  Backup History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingBackups ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2">Loading backups...</span>
                  </div>
                ) : backups.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Archive className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">No Backups Found</h3>
                    <p className="mb-4">Create your first backup to get started</p>
                    <Button onClick={createBackup} disabled={creatingBackup}>
                      <Archive className="mr-2 h-4 w-4" />
                      Create First Backup
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {backups.map((backup) => (
                      <div key={backup.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                backup.status === 'completed' ? 'bg-green-500' : 
                                backup.status === 'failed' ? 'bg-red-500' : 
                                backup.status === 'creating' ? 'bg-yellow-500' : 'bg-gray-500'
                              }`}></div>
                              <div>
                                <h4 className="font-semibold text-gray-800">{backup.name}</h4>
                                <p className="text-sm text-gray-600">
                                  {backup.description || 'No description'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-6 mt-2 text-xs text-gray-500">
                              <span>
                                Created: {new Date(backup.created_at).toLocaleString()}
                              </span>
                              <span>
                                Size: {backup.file_size ? formatBytes(backup.file_size) : 'N/A'}
                              </span>
                              <span>
                                Type: {backup.backup_type}
                              </span>
                              {backup.database_collections && (
                                <span>
                                  Collections: {Object.keys(backup.database_collections).length}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {backup.status === 'completed' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => verifyBackup(backup.id)}
                                  disabled={verifyingBackup}
                                  title="Verify backup integrity"
                                >
                                  {verifyingBackup ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Shield className="h-3 w-3" />
                                  )}
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedBackup(backup);
                                    setShowRestoreConfirm(true);
                                  }}
                                  disabled={restoringBackup}
                                  className="text-green-600 hover:text-green-700"
                                  title="Restore from this backup"
                                >
                                  {restoringBackup ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Download className="h-3 w-3" />
                                  )}
                                </Button>
                              </>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteBackup(backup.id, backup.name)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete backup"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {backup.status === 'failed' && backup.error_message && (
                          <div className="mt-3 p-3 bg-red-50 rounded border-l-4 border-red-500">
                            <div className="flex items-center">
                              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                              <span className="text-sm text-red-700">{backup.error_message}</span>
                            </div>
                          </div>
                        )}
                        
                        {backup.status === 'completed' && backup.database_collections && (
                          <div className="mt-3 p-3 bg-blue-50 rounded">
                            <h5 className="text-sm font-semibold text-blue-800 mb-2">Backup Contents:</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-600">
                              {Object.entries(backup.database_collections).map(([collection, count]) => (
                                <div key={collection}>
                                  <span className="font-medium">{collection}:</span> {count}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Restore Confirmation Dialog */}
            {showRestoreConfirm && selectedBackup && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <div className="flex items-center mb-4">
                    <AlertCircle className="h-6 w-6 text-orange-500 mr-3" />
                    <h3 className="text-lg font-semibold">Confirm Restore</h3>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-gray-600 mb-4">
                      Are you sure you want to restore from the backup "{selectedBackup.name}"?
                    </p>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Warning:</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• This will overwrite your current data</li>
                        <li>• All unsaved changes will be lost</li>
                        <li>• The application will refresh after restore</li>
                        <li>• This action cannot be undone</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <h4 className="font-semibold text-blue-800 mb-2">Backup Details:</h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        <div>Created: {new Date(selectedBackup.created_at).toLocaleString()}</div>
                        <div>Size: {formatBytes(selectedBackup.file_size || 0)}</div>
                        {selectedBackup.database_collections && (
                          <div>Collections: {Object.keys(selectedBackup.database_collections).join(', ')}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRestoreConfirm(false);
                        setSelectedBackup(null);
                      }}
                      disabled={restoringBackup}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => restoreBackup(selectedBackup.id)}
                      disabled={restoringBackup}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {restoringBackup ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Restoring...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Confirm Restore
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
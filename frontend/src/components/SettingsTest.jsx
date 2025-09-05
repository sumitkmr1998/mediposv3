import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useFormatters } from '../hooks/useFormatters';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const SettingsTest = () => {
  const { settings, loading } = useSettings();
  const { formatCurrency, formatDate, formatDateTime, formatPercentage } = useFormatters();

  if (loading) {
    return <div>Loading settings...</div>;
  }

  const testAmount = 1234.567;
  const testDate = new Date();

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold">Settings Context Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Shop Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Name:</strong> {settings.general.shop_name}</p>
              <p><strong>Address:</strong> {settings.general.shop_address}</p>
              <p><strong>Phone:</strong> {settings.general.shop_phone}</p>
              <p><strong>Currency:</strong> {settings.general.currency} ({settings.general.currency_symbol})</p>
              <p><strong>Tax Rate:</strong> {formatPercentage(settings.general.default_tax_rate)}</p>
              <p><strong>Decimal Places:</strong> {settings.general.decimal_places}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formatting Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Test Amount ({testAmount}):</strong> {formatCurrency(testAmount)}</p>
              <p><strong>Today's Date:</strong> {formatDate(testDate)}</p>
              <p><strong>Current DateTime:</strong> {formatDateTime(testDate)}</p>
              <p><strong>Tax Example:</strong> {formatPercentage(settings.general.default_tax_rate)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Date & Time Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Date Format:</strong> {settings.general.date_format}</p>
              <p><strong>Time Format:</strong> {settings.general.time_format}</p>
              <p><strong>Timezone:</strong> {settings.general.timezone}</p>
              <p><strong>Language:</strong> {settings.general.language}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Auto Backup:</strong> {settings.general.auto_backup ? 'Enabled' : 'Disabled'}</p>
              <p><strong>Backup Frequency:</strong> {settings.general.backup_frequency}</p>
              <p><strong>System Version:</strong> {settings.general.system_version}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Raw Settings Data (for debugging)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-64">
            {JSON.stringify(settings, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTest;
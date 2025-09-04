import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const UserPermissions = ({ user, onPermissionsChange, readonly = false }) => {
  const [permissions, setPermissions] = useState({});
  const [permissionDefinitions, setPermissionDefinitions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchPermissionDefinitions();
    if (user?.permissions) {
      setPermissions(user.permissions);
    }
  }, [user]);

  const fetchPermissionDefinitions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/permissions/definitions`);
      setPermissionDefinitions(response.data);
    } catch (error) {
      setError('Failed to fetch permission definitions');
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permissionKey, value) => {
    if (readonly) return;
    
    const newPermissions = {
      ...permissions,
      [permissionKey]: value
    };
    
    setPermissions(newPermissions);
    setHasChanges(true);
    
    if (onPermissionsChange) {
      onPermissionsChange(newPermissions);
    }
  };

  const resetToRoleDefaults = () => {
    if (readonly) return;
    
    // Set default permissions based on role
    const roleDefaults = getRoleDefaults(user?.role || 'staff');
    setPermissions(roleDefaults);
    setHasChanges(true);
    
    if (onPermissionsChange) {
      onPermissionsChange(roleDefaults);
    }
  };

  const getRoleDefaults = (role) => {
    if (role === 'admin') {
      // Admin gets all permissions
      const allPermissions = {};
      Object.keys(permissionDefinitions.permissions || {}).forEach(key => {
        allPermissions[key] = true;
      });
      return allPermissions;
    } else if (role === 'manager') {
      return {
        medicines_view: true, medicines_add: true, medicines_edit: true, medicines_delete: false,
        patients_view: true, patients_add: true, patients_edit: true, patients_delete: false,
        sales_view: true, sales_add: true, sales_edit: true, sales_delete: false, sales_refund: true,
        doctors_view: true, doctors_add: true, doctors_edit: true, doctors_delete: false,
        opd_view: true, opd_add: true, opd_edit: true, opd_delete: false,
        analytics_view: true, analytics_export: true,
        settings_view: true, settings_edit: false,
        users_view: false, users_add: false, users_edit: false, users_delete: false,
        backup_create: true, backup_restore: false, backup_delete: false
      };
    } else { // staff
      return {
        medicines_view: true, medicines_add: false, medicines_edit: false, medicines_delete: false,
        patients_view: true, patients_add: true, patients_edit: true, patients_delete: false,
        sales_view: true, sales_add: true, sales_edit: false, sales_delete: false, sales_refund: false,
        doctors_view: true, doctors_add: false, doctors_edit: false, doctors_delete: false,
        opd_view: true, opd_add: true, opd_edit: false, opd_delete: false,
        analytics_view: false, analytics_export: false,
        settings_view: false, settings_edit: false,
        users_view: false, users_add: false, users_edit: false, users_delete: false,
        backup_create: false, backup_restore: false, backup_delete: false
      };
    }
  };

  const renderPermissionCategory = (categoryName, categoryPermissions) => {
    return (
      <Card key={categoryName} className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium capitalize flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {categoryName} Permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categoryPermissions.map((permissionKey) => {
            const isEnabled = permissions[permissionKey] || false;
            const description = permissionDefinitions.permissions?.[permissionKey] || permissionKey;
            
            return (
              <div key={permissionKey} className="flex items-center justify-between space-x-2">
                <div className="flex-1">
                  <Label className="text-sm font-normal cursor-pointer" htmlFor={permissionKey}>
                    {description}
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    {permissionKey.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isEnabled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <Switch
                    id={permissionKey}
                    checked={isEnabled}
                    onCheckedChange={(value) => handlePermissionChange(permissionKey, value)}
                    disabled={readonly}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">User Permissions</h3>
          <p className="text-sm text-gray-600">
            Configure granular permissions for {user?.full_name || 'this user'}
          </p>
        </div>
        
        {!readonly && hasChanges && (
          <div className="text-sm text-blue-600 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Changes pending
          </div>
        )}
      </div>

      {!readonly && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToRoleDefaults}
          >
            Reset to Role Defaults
          </Button>
        </div>
      )}

      <Separator />

      <div className="grid gap-4">
        {permissionDefinitions.categories && 
          Object.entries(permissionDefinitions.categories).map(([categoryName, categoryPermissions]) =>
            renderPermissionCategory(categoryName, categoryPermissions)
          )
        }
      </div>

      {readonly && (
        <Alert>
          <AlertDescription>
            Permission settings are read-only. Only administrators can modify user permissions.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default UserPermissions;
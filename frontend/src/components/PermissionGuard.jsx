import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Alert, AlertDescription } from './ui/alert';
import { Shield } from 'lucide-react';

const PermissionGuard = ({ 
  permission, 
  permissions = [], 
  requireAll = false,
  children, 
  fallback = null,
  showAlert = true 
}) => {
  const { hasPermission, hasAnyPermission, isAdmin } = useAuth();

  // Admin always has access
  if (isAdmin()) {
    return children;
  }

  let hasAccess = false;

  if (permission) {
    // Single permission check
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    if (requireAll) {
      // User must have ALL specified permissions
      hasAccess = permissions.every(perm => hasPermission(perm));
    } else {
      // User must have ANY of the specified permissions
      hasAccess = hasAnyPermission(permissions);
    }
  }

  if (hasAccess) {
    return children;
  }

  // Show fallback content if provided
  if (fallback) {
    return fallback;
  }

  // Show alert by default
  if (showAlert) {
    return (
      <Alert variant="destructive">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access this feature.
        </AlertDescription>
      </Alert>
    );
  }

  // Return nothing
  return null;
};

export default PermissionGuard;
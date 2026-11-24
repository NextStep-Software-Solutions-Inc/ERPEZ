import React from 'react';
import { usePermissions } from '~/hooks/usePermissions';
import LoadingSpinner from '~/components/LoadingSpinner';
import Unauthorized from './Unauthorized';

interface RoutePermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
}

export default function RoutePermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
}: RoutePermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="md" message="Verifying permissions..." />
      </div>
    );
  }

  if (permission && !hasPermission(permission)) {
    return <Unauthorized />;
  }

  if (permissions && permissions.length > 0) {
    const isAllowed = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!isAllowed) {
      return <Unauthorized />;
    }
  }

  return <>{children}</>;
}

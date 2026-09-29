import { useQuery } from '@tanstack/react-query';
import { api } from '~/services/api';
import { useClerkAuth } from '~/providers/ClerkAuthProvider';
import { useTenant } from '~/providers/TenantProvider';

export function usePermissions() {
  const { isAuthenticated, isInitialized } = useClerkAuth();
  const { tenant } = useTenant();

  const {
    data: permissionsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['my-permissions', tenant?.id],
    queryFn: async () => {
      const response = await api.get('/auth/me/permissions');
      return (response.data?.data as string[]) || [];
    },
    enabled: Boolean(isAuthenticated && isInitialized),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const permissions = new Set<string>(permissionsData || []);

  const hasPermission = (permission: string): boolean => {
    return permissions.has(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.some((p) => permissions.has(p));
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.every((p) => permissions.has(p));
  };

  const isPlatformAdmin =
    permissions.has('platform.tenants.manage') ||
    permissions.has('platform.users.manage') ||
    permissions.has('platform.settings.manage');

  const isTenantAdmin =
    permissions.has('tenant.members.manage') ||
    permissions.has('tenant.roles.manage') ||
    permissions.has('tenant.workspace.manage');

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isPlatformAdmin,
    isTenantAdmin,
    isLoading,
    refetch,
  };
}

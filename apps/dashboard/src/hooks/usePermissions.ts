import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { useUnifiedAuth } from '@/auth/UnifiedAuthContext'

export type PermissionStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * Hook for resolving functional permissions assigned to the current user.
 * Implements strict deny-by-default and fail-closed state semantics.
 */
export function usePermissions() {
  const { token, isAuthenticated, userName, tenantId, activeDevUser, isSuperAdmin, activeRole, role } = useUnifiedAuth()

  const currentRole = activeRole || role || ''
  const isWorkspaceAdmin =
    currentRole === 'System Administrator' ||
    currentRole === 'Workspace Administrator' ||
    currentRole === 'Platform Administrator'

  const {
    data: permissions = [],
    isLoading,
    isError,
    isSuccess,
    refetch,
  } = useQuery<string[]>({
    queryKey: [
      'my-permissions',
      userName || 'anonymous',
      tenantId || 'default',
      activeDevUser || 'default',
      currentRole || 'default',
    ],
    queryFn: async () => {
      if (!isAuthenticated || !token) {
        return []
      }
      const res = await api.get('/auth/me/permissions')
      return res.data?.data || []
    },
    staleTime: 60 * 1000,
    enabled: typeof window !== 'undefined' && !!isAuthenticated && !!token,
  })

  const status: PermissionStatus = isLoading
    ? 'loading'
    : isError
      ? 'error'
      : isSuccess
        ? 'success'
        : 'idle'

  const isLoaded = isWorkspaceAdmin || status === 'success'

  // Fail closed for non-administrators; workspace administrators hold full operational authority
  const hasPermission = (permission: string): boolean => {
    if (isWorkspaceAdmin) return true
    if (!isLoaded) return false
    return permissions.includes(permission)
  }

  const hasAnyPermission = (perms: readonly string[]): boolean => {
    if (isWorkspaceAdmin) return true
    if (!isLoaded) return false
    return perms.some((p) => permissions.includes(p))
  }

  const hasAllPermissions = (perms: readonly string[]): boolean => {
    if (isWorkspaceAdmin) return true
    if (!isLoaded) return false
    return perms.every((p) => permissions.includes(p))
  }

  return {
    permissions,
    isSuperAdmin,
    status,
    isLoading,
    isLoaded,
    isError,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refetch,
  }
}

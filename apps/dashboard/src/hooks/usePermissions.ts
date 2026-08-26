import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { useKeycloak } from '@/providers/KeycloakProvider'

/**
 * Hook for resolving functional permissions assigned to the current user.
 */
export function usePermissions() {
  const { token, isAuthenticated, activeDevUser } = useKeycloak()

  const { data: permissions = [], isLoading, refetch } = useQuery<string[]>({
    queryKey: ['my-permissions', token, activeDevUser],
    queryFn: async () => {
      if (!isAuthenticated || !token) {
        return []
      }
      try {
        const res = await api.get('/auth/me/permissions')
        return res.data?.data || []
      } catch (err) {
        console.warn('Failed to fetch user permissions:', err)
        return []
      }
    },
    staleTime: 60 * 1000,
    enabled: typeof window !== 'undefined' && !!isAuthenticated && !!token,
  })

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission)
  }

  const hasAnyPermission = (perms: string[]): boolean => {
    return perms.some((p) => permissions.includes(p))
  }

  return { permissions, hasPermission, hasAnyPermission, isLoading, refetch }
}

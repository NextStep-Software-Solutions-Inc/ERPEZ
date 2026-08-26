import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import keycloak from '@/auth/keycloak'

/**
 * Hook for resolving functional permissions assigned to the current user.
 */
export function usePermissions() {
  const { data: permissions = [], isLoading } = useQuery<string[]>({
    queryKey: ['my-permissions', keycloak.token],
    queryFn: async () => {
      if (!keycloak.authenticated) {
        return []
      }
      const res = await api.get('/auth/me/permissions')
      return res.data?.data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    enabled: !!keycloak.authenticated,
  })

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission)
  }

  const hasAnyPermission = (perms: string[]): boolean => {
    return perms.some((p) => permissions.includes(p))
  }

  return { permissions, hasPermission, hasAnyPermission, isLoading }
}

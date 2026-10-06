import api from '@/services/api'

export interface OperationalRoleSummary {
  id: string
  name: string
  description?: string
  isSystemRole: boolean
  scope?: string
  permissions?: string[]
  permissionKeys?: string[]
  permissionDisplayNames?: string[]
}

interface ApiResponse<T> {
  succeeded: boolean
  message: string | null
  data: T
}

/**
 * Fetches operational business roles assignable within the active tenant workspace.
 * Calls domain-specific endpoint: GET /api/ams/roles (with fallback support)
 */
export async function fetchAssignableOperationalRoles(): Promise<
  OperationalRoleSummary[]
> {
  try {
    const response = await api.get<ApiResponse<OperationalRoleSummary[]>>(
      '/api/ams/roles',
    )
    const roles = response.data?.data || []
    return roles.map((r: any) => ({
      ...r,
      permissionDisplayNames: r.permissionDisplayNames || r.permissions || [],
    }))
  } catch (error: any) {
    if (error?.response?.status === 404) {
      // Fallback to legacy endpoint if backend hasn't mounted /api/ams/roles
      const fallback = await api.get<ApiResponse<OperationalRoleSummary[]>>(
        '/operational-roles/assignable',
      )
      return fallback.data?.data || []
    }
    throw error
  }
}

/**
 * Assigns operational roles to a personnel/member identified canonically by userId.
 * Calls domain-specific endpoint: POST /api/ams/roles/assign
 */
export async function assignOperationalRoles(
  userId: string,
  roleIds: string[],
): Promise<void> {
  try {
    await api.post<ApiResponse<void>>('/api/ams/roles/assign', {
      userId,
      roleIds,
    })
  } catch (error: any) {
    if (error?.response?.status === 404) {
      // Fallback to legacy endpoint
      await api.post<ApiResponse<void>>('/operational-roles/assignments', {
        targetTenantMemberId: userId,
        roleIds,
      })
      return
    }
    throw error
  }
}

/**
 * Fetches operational roles assigned to a specific user.
 * Calls domain-specific endpoint: GET /api/ams/roles/users/{userId}
 */
export async function fetchUserAssignedRoles(userId: string): Promise<OperationalRoleSummary[]> {
  const response = await api.get<ApiResponse<OperationalRoleSummary[]>>(`/api/ams/roles/users/${userId}`)
  return response.data?.data || []
}


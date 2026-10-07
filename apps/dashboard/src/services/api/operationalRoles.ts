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

export interface AssignOperationalRolesPayload {
  userId?: string
  email?: string
  fullName?: string
  externalIdentityId?: string
  roleIds: string[]
}

export interface UserRoleAssignmentSummary {
  userId: string
  externalIdentityId?: string
  email?: string
  roles: string[]
}

/**
 * Assigns operational roles to a personnel/member identified canonically by userId or email.
 * Calls domain-specific endpoint: POST /api/ams/roles/assign
 */
export async function assignOperationalRoles(
  payload: AssignOperationalRolesPayload | string,
  roleIds?: string[],
): Promise<void> {
  const body =
    typeof payload === 'string'
      ? { userId: payload, roleIds: roleIds || [] }
      : payload

  try {
    await api.post<ApiResponse<void>>('/api/ams/roles/assign', body)
  } catch (error: any) {
    if (error?.response?.status === 404 && body.userId) {
      // Fallback to legacy endpoint
      await api.post<ApiResponse<void>>('/operational-roles/assignments', {
        targetTenantMemberId: body.userId,
        roleIds: body.roleIds,
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

/**
 * Fetches operational role assignments for all users in the active workspace.
 * Calls domain-specific endpoint: GET /api/ams/roles/assignments
 */
export async function fetchAllUserRoleAssignments(): Promise<UserRoleAssignmentSummary[]> {
  try {
    const response = await api.get<ApiResponse<UserRoleAssignmentSummary[]>>('/api/ams/roles/assignments')
    return response.data?.data || []
  } catch (error) {
    console.warn('Failed to fetch user role assignments:', error)
    return []
  }
}



import api from '@/services/api'

export interface OperationalRoleSummary {
  id: string
  name: string
  description?: string
  isSystemRole: boolean
  scope: string
  permissionKeys: string[]
  permissionDisplayNames: string[]
}

interface ApiResponse<T> {
  succeeded: boolean
  message: string | null
  data: T
}

/**
 * Fetches operational business roles assignable within the active tenant workspace.
 * Calls domain-specific endpoint: GET /operational-roles/assignable
 */
export async function fetchAssignableOperationalRoles(): Promise<
  OperationalRoleSummary[]
> {
  const response = await api.get<ApiResponse<OperationalRoleSummary[]>>(
    '/operational-roles/assignable',
  )
  return response.data?.data || []
}

/**
 * Assigns operational roles to a personnel/member identified canonically by TargetTenantMemberId.
 * Calls domain-specific endpoint: POST /operational-roles/assignments
 */
export async function assignOperationalRoles(
  targetTenantMemberId: string,
  roleIds: string[],
): Promise<void> {
  await api.post<ApiResponse<void>>('/operational-roles/assignments', {
    targetTenantMemberId,
    roleIds,
  })
}

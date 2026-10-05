import api from '@/services/api'

export interface LicenseStatusDto {
  isValid: boolean
  plan: string
  licenseKey: string
  allowedDomain: string
  maxUsers: number
  activeUsersCount: number
  remainingDays: number
  expiresAt?: string
  enabledModules: string[]
  message?: string
  isAirGapped: boolean
}

export interface LicenseActivationResultDto {
  success: boolean
  message: string
  status?: LicenseStatusDto
}

export interface AmsRoleDto {
  id: string
  name: string
  description: string
  isSystemRole: boolean
  isActive: boolean
  userCount: number
  permissionCount: number
  permissions: string[]
}

export interface CreateAmsRoleDto {
  name: string
  description: string
  permissions: string[]
}

export interface UpdateAmsRoleDto {
  name: string
  description: string
  isActive: boolean
  permissions: string[]
}

export interface PermissionGroupDto {
  category: string
  permissions: string[]
}

interface ApiResponse<T> {
  succeeded: boolean
  message: string | null
  data: T
}

export async function fetchLicenseStatus(): Promise<LicenseStatusDto> {
  const response = await api.get<ApiResponse<LicenseStatusDto>>('/api/ams/license/status')
  return response.data?.data
}

export async function activateLicenseKey(key: string): Promise<LicenseActivationResultDto> {
  const response = await api.post<ApiResponse<LicenseActivationResultDto>>('/api/ams/license/activate', { key })
  return response.data?.data
}

export async function fetchAmsRoles(): Promise<AmsRoleDto[]> {
  const response = await api.get<ApiResponse<AmsRoleDto[]>>('/api/ams/roles')
  return response.data?.data || []
}

export async function fetchAmsRoleById(id: string): Promise<AmsRoleDto> {
  const response = await api.get<ApiResponse<AmsRoleDto>>(`/api/ams/roles/${id}`)
  return response.data?.data
}

export async function createAmsRole(payload: CreateAmsRoleDto): Promise<string> {
  const response = await api.post<ApiResponse<string>>('/api/ams/roles', payload)
  return response.data?.data
}

export async function updateAmsRole(id: string, payload: UpdateAmsRoleDto): Promise<boolean> {
  const response = await api.put<ApiResponse<boolean>>(`/api/ams/roles/${id}`, payload)
  return response.data?.data
}

export async function deleteAmsRole(id: string): Promise<boolean> {
  const response = await api.delete<ApiResponse<boolean>>(`/api/ams/roles/${id}`)
  return response.data?.data
}

export async function fetchPermissionCatalog(): Promise<PermissionGroupDto[]> {
  const response = await api.get<ApiResponse<PermissionGroupDto[]>>('/api/ams/roles/permissions')
  return response.data?.data || []
}

export async function assignUserAmsRoles(userId: string, roleIds: string[]): Promise<void> {
  await api.post<ApiResponse<boolean>>('/api/ams/roles/assign', { userId, roleIds })
}

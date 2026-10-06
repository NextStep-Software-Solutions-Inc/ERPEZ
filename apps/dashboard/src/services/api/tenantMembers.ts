import axios from 'axios'
import { getStoredToken } from '@/auth/authBridge'

export interface TenantMemberDto {
  id: string
  tenantId?: string
  userId?: string
  externalIdentityId?: string
  email?: string
  firstName?: string
  lastName?: string
  fullName?: string
  role?: string
  roles?: string[]
  status?: string
}

export interface TenantDto {
  id: string
  name: string
  slug?: string
  authProvider?: string
  plan?: string
  seatCapacity?: number
  seatsUsed?: number
}

const getTenantApiUrl = () => {
  return import.meta.env.VITE_TENANT_API_URL || 'http://localhost:5246'
}

const getAuthHeaders = async () => {
  const token = await getStoredToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  const candidateId = typeof window !== 'undefined'
    ? (sessionStorage.getItem('erpez_candidate_tenant_id') || localStorage.getItem('erpez_tenant_id'))
    : null
  if (candidateId) {
    headers['X-Tenant-Id'] = candidateId
  }
  return headers
}

/**
 * Fetch authorized workspaces for current user from TenantManagement.Api
 */
export async function fetchMyTenants(): Promise<TenantDto[]> {
  try {
    const headers = await getAuthHeaders()
    const res = await axios.get(`${getTenantApiUrl()}/tenants/my?pageSize=50&pageNumber=1`, { headers })
    const items = res.data?.data || []
    return Array.isArray(items) ? items : []
  } catch (err) {
    console.warn('Failed to fetch tenants from TenantManagement.Api:', err)
    return []
  }
}

/**
 * Fetch tenant members for active workspace from TenantManagement.Api
 */
export async function fetchTenantMembers(): Promise<TenantMemberDto[]> {
  try {
    const headers = await getAuthHeaders()
    const res = await axios.get(`${getTenantApiUrl()}/tenant-members?pageSize=100&pageNumber=1`, { headers })
    const items = res.data?.data || []
    return Array.isArray(items) ? items : []
  } catch (err) {
    console.warn('Failed to fetch tenant members from TenantManagement.Api:', err)
    return []
  }
}

/**
 * Invite a member to the active tenant via TenantManagement.Api
 */
export async function inviteTenantMember(payload: {
  email: string
  firstName?: string
  lastName?: string
  roleIds?: string[]
}) {
  const headers = await getAuthHeaders()
  const nameParts = payload.email.split('@')[0].split(/[._-]/)
  const defaultFirst = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Workspace'
  const defaultLast = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : 'Member'

  const body: Record<string, any> = {
    email: payload.email.trim().toLowerCase(),
    firstName: payload.firstName || defaultFirst,
    lastName: payload.lastName || defaultLast,
  }

  if (payload.roleIds && payload.roleIds.length > 0) {
    // Only pass roleIds if they are valid GUIDs
    const validGuids = payload.roleIds.filter((id) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    )
    if (validGuids.length > 0) {
      body.roleIds = validGuids
    }
  }

  const res = await axios.post(`${getTenantApiUrl()}/tenant-members`, body, { headers })
  return res.data
}


import api from '@/services/api'

// API response types based on backend sample
export interface UserApiResponse {
  id: string
  employeeNumber: string
  username: string
  email: string
  firstName: string
  middleName?: string | null
  lastName: string
  nameExtension?: string | null
  phoneNumber?: string
  employmentStatus?: string
  dateHired?: string
  dateSeparated?: string | null
  isActive?: boolean
  officeId?: string
  createdAt?: string
  createdBy?: string
  officeName?: string
  officeCode?: string | null
  fullName?: string
}

export interface UsersApiPayload {
  succeeded: boolean
  message: string | null
  data: UserApiResponse[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

// client-side user type for forms
export interface User {
  id: string
  employeeNumber: string
  username: string
  email: string
  firstName: string
  middleName?: string | null
  lastName: string
  nameExtension?: string | null
  phoneNumber?: string
  employmentStatus?: string
  dateHired?: string
  dateSeparated?: string | null
  isActive?: boolean
  officeId?: string
  officeName?: string
  fullName: string
}

/**
 * Maps API user to client User type, ensuring fullName is always set.
 */
function mapUser(api: UserApiResponse): User {
  // build a sanitized full name; drop any standalone "n/a" pieces
  let fullName = api.fullName
  if (fullName) {
    // remove occurrences of " n/a" or "/n/a" etc
    fullName = fullName.replace(/\s*n\/a\b/gi, '').trim()
  }

  if (!fullName) {
    fullName = [api.firstName, api.middleName, api.lastName, api.nameExtension]
      .filter((part) => part && part.toLowerCase() !== 'n/a') // drop "n/a" extensions
      .join(' ')
  }

  return {
    id: api.id,
    employeeNumber: api.employeeNumber,
    username: api.username,
    email: api.email,
    firstName: api.firstName,
    middleName: api.middleName,
    lastName: api.lastName,
    nameExtension: api.nameExtension,
    phoneNumber: api.phoneNumber,
    employmentStatus: api.employmentStatus,
    dateHired: api.dateHired,
    dateSeparated: api.dateSeparated,
    isActive: api.isActive,
    officeId: api.officeId,
    officeName: api.officeName,
    fullName,
  }
}

/**
 * Fetch users from API (first page, 100 records)
 */
// Authorization header is automatically applied by axios interceptor
export async function fetchUsers(): Promise<User[]> {
  try {
    const response = await api.get<UsersApiPayload>('/users?PageNumber=1&PageSize=100')
    if (response.data && response.data.succeeded && Array.isArray(response.data.data)) {
      return response.data.data.map(mapUser)
    }
    return []
  } catch (error) {
    console.error('Failed to fetch users from API:', error)
    throw error
  }
}

/**
 * Utility for display name (same logic as mapping above)
 */
export function getUserDisplayName(user: User): string {
  return user.fullName
}


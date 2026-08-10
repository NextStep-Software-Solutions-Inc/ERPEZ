import type {
  QueryBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

export interface Office {
  id: string
  name: string
  code?: string
  address?: string
  isActive?: boolean
}

export interface OfficesResponse {
  succeeded: boolean
  message?: string
  data: Office[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

const endpoint = '/offices' as const

/**
 * Fetch list of offices for selection in APP creation
 * Extracts offices array from paginated response
 * 
 * Usage:
 * ```tsx
 * const useOffices = createQueryHookFromTemplate(getOfficesRequest)
 * const { data: offices } = useOffices({})
 * ```
 */
export const getOfficesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  Office[]
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl }) => {
    try {
      const response = await api.get<OfficesResponse>(finalUrl)
      // Extract offices array from paginated response
      return response.data.data || []
    } catch (error) {
      console.error('Failed to fetch offices:', error)
      throw error
    }
  },
}

import type {
  QueryBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

export interface FiscalYear {
  id: string
  year: number
  description?: string
  status: 'setup' | 'planning' | 'active' | 'closed'
  isLocked: boolean
  startDate?: string
  endDate?: string
  functionAllocations?: any[]
}

export interface FiscalYearsResponse {
  succeeded: boolean
  message?: string
  data: FiscalYear[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

const endpoint = '/fiscal-years' as const

/**
 * Fetch list of fiscal years for selection in APP creation
 * 
 * Usage:
 * ```tsx
 * const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)
 * const { data: response } = useFiscalYears({})
 * const fiscalYears = response?.data || []
 * ```
 */
export const getFiscalYearsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  FiscalYearsResponse
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl }) => {
    try {
      const response = await api.get<FiscalYearsResponse>(finalUrl)
      return response.data
    } catch (error) {
      console.error('Failed to fetch fiscal years:', error)
      throw error
    }
  },
}

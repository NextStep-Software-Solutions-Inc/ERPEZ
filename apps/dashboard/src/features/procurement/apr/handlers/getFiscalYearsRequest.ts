import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

export interface FiscalYearDto {
  id: string
  year: number
  description?: string
  status: string
  isLocked?: boolean
  startDate?: string
  endDate?: string
}

export interface FiscalYearsResponse {
  succeeded: boolean
  message?: string
  data: FiscalYearDto[]
  pageNumber?: number
  pageSize?: number
  totalPages?: number
  totalCount?: number
}

const endpoint = '/fiscal-years' as const

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

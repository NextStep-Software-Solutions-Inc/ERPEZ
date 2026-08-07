/**
 * Fiscal Years Request Blueprint
 * 
 * Fetches all fiscal years from the API
 * GET /fiscal-years
 */

import { api } from '@/services/api'
import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'

export interface FiscalYear {
  id: string
  year: number
  description?: string
  status: 'Draft' | 'Locked' | 'Active'
  isLocked: boolean
  startDate?: string
  endDate?: string
  createdAt?: string
  updatedAt?: string
}

export interface FiscalYearsPaginatedResponse {
  succeeded: boolean
  message: string | null
  data: FiscalYear[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

const endpoint = '/fiscal-years'

export const getFiscalYearsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  FiscalYearsPaginatedResponse
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<FiscalYearsPaginatedResponse>(finalUrl, { signal })
    return response.data
  },
}

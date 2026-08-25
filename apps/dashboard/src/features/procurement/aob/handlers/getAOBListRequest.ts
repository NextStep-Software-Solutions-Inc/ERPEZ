/**
 * Get AOB List Request Handler
 * Fetches paginated list of Abstract of Bids with filtering and pagination
 */

import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'
import type { PaginationResponse } from 'erpez-shared-lib'
import type { AOB } from '../types'
import api from '@/services/api'

const endpoint = '/aobs'

export interface GetAOBListParams {
  pageNumber?: number
  pageSize?: number
  filters?: string
  sorts?: string
  status?: string
  search?: string
}

export const getAOBListRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<AOB>,
  GetAOBListParams
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<any>>(finalUrl, { signal })
    const mappedData = (response.data.data || []).map((item: any) => ({
      ...item,
      date: item.aobDate || item.date || '',
      aobDate: item.aobDate || item.date || '',
      createdAt: item.aobDate || item.createdAt || '',
    }))

    return {
      ...response.data,
      data: mappedData,
    }
  },
}

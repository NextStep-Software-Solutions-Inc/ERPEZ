/**
 * Get PSDBM Items Request Handler
 * Query blueprint for fetching items from PSDBM (PS-PhilGEPS) catalog
 * 
 * Architecture:
 * Frontend calls ERPEZ backend endpoint → Backend queries PostgreSQL database / PS-PhilGEPS
 * 
 * Backend endpoints:
 * - GET /api/psdbm/items/:mode?search=X&category=Y&depot=Z&pageNumber=1&pageSize=25&stockFilter=in_stock&sortBy=stock&sortDescending=true
 */

import type {
  QueryBlueprintFromTemplate,
  APIResponse,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { PSDBMCatalogResponse } from '../types'

const endpoint = '/api/psdbm/items/:mode' as const

export interface GetPSDBMItemsParams extends QueryParams {
  search?: string
  category?: string
  max?: number
  depot?: string
  availability?: string
  stockFilter?: string
  sortBy?: string
  sortDescending?: boolean
  pageNumber?: number
  pageSize?: number
}

export const getPSDBMItemsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PSDBMCatalogResponse>,
  GetPSDBMItemsParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<PSDBMCatalogResponse>>(finalUrl, { signal })
    return response.data
  },
}

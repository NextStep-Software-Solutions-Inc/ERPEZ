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
import { createFallbackCatalogResponse } from '../utils/psdbmFallback'

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
  key: ({ finalUrl }) =>
    [finalUrl] as const,
  fetcher: async ({ finalUrl, signal }) => {
    try {
      const response = await api.get<APIResponse<PSDBMCatalogResponse>>(finalUrl, { signal })
      return response.data
    } catch (error) {
      console.warn('[PSDBM Items] API request failed, using mock data fallback', error)
      
      if (!import.meta.env.DEV) {
        return {
          succeeded: true,
          message: 'API unavailable',
          data: {
            items: [],
            category: 'All',
            searchTerm: '',
            mode: 'main',
            totalItems: 0,
            pageNumber: 1,
            pageSize: 25,
            totalPages: 1,
            isMockData: false,
          },
          errors: {},
        } as unknown as APIResponse<PSDBMCatalogResponse>
      }
      
      const fallbackData = await createFallbackCatalogResponse()
      return {
        succeeded: true,
        message: 'Using fallback mock data',
        data: fallbackData,
        errors: {},
      } as unknown as APIResponse<PSDBMCatalogResponse>
    }
  },
}

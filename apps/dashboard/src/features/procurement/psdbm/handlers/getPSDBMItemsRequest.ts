/**
 * Get PSDBM Items Request Handler
 * Query blueprint for fetching items from PSDBM (PS-PhilGEPS) catalog
 * 
 * Architecture:
 * Frontend calls ERPEZ backend endpoint → Backend fetches from PS-PhilGEPS
 * 
 * Backend proxy endpoints:
 * - GET /api/psdbm/items/main?search=X&category=Y&max=50
 * - GET /api/psdbm/items/regional?search=X&category=Y&depot=Z&max=50
 * - GET /api/psdbm/items/lgu?search=X&category=Y&depot=Z&max=50
 * 
 * Supports three catalog modes: Main, Regional (Depot), LGU
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

interface GetPSDBMItemsParams extends QueryParams {
  search?: string
  category?: string
  max?: number
  depot?: string
}

export const getPSDBMItemsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PSDBMCatalogResponse>,
  GetPSDBMItemsParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) =>
    [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    // BACKEND PROXY PATTERN:
    // Frontend calls: GET /api/psdbm/items/:mode?search=X&category=Y&depot=Z&max=50
    // Backend handles CORS and fetches from external PS-PhilGEPS URLs
    // Uses configured VITE_ERPEZ_BACKEND_URL from environment
    
    try {
      const response = await api.get<APIResponse<PSDBMCatalogResponse>>(finalUrl, { signal })
      return response.data
    } catch (error) {
      // Fallback: If URL doesn't return data, return mock data (dev only)
      console.warn('[PSDBM Items] API request failed, using mock data fallback', error)
      
      if (!import.meta.env.DEV) {
        // In production, return empty array instead of mock data
        return {
          succeeded: true,
          message: 'API unavailable',
          data: {
            items: [],
            category: 'All',
            searchTerm: '',
            mode: 'main',
            totalItems: 0,
            isMockData: false,
          },
          errors: {},
        } as unknown as APIResponse<PSDBMCatalogResponse>
      }
      
      // Dev: Return mock data fallback
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

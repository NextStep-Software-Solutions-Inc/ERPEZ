/**
 * Get PSDBM Categories Request Handler
 * Query blueprint for fetching available categories
 * 
 * Backend proxy endpoint:
 * - GET /api/psdbm/categories/:mode
 * 
 * Categories are mode-specific (Main, Regional, LGU may have different categories)
 * Results cached for 1 hour
 */

import type {
  QueryBlueprintFromTemplate,
  APIResponse,
  QueryKey,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { PSDBMCategory } from '../types'
import { getMockCategoriesFallback } from '../utils/psdbmFallback'

const endpoint = '/api/psdbm/categories/:mode' as const

export const getPSDBMCategoriesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PSDBMCategory[]>,
  undefined,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    // Backend proxy endpoint: /api/psdbm/categories/:mode
    // Uses configured VITE_ERPEZ_BACKEND_URL from environment
    try {
      const response = await api.get<APIResponse<PSDBMCategory[]>>(finalUrl, { signal })
      return response.data
    } catch (error) {
      // Fallback: If URL doesn't return data, return mock categories
      console.warn('[PSDBM Categories] API request failed, using mock data fallback', error)
      return {
        succeeded: true,
        message: 'Using fallback mock data',
        data: getMockCategoriesFallback(),
        errors: {},
      }
    }
  },

  // Aggressive caching - categories change infrequently
  defaultOptions: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours garbage collection
  },
}

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
    const response = await api.get<APIResponse<PSDBMCategory[]>>(finalUrl, { signal })
    return response.data
  },

  // Aggressive caching - categories change infrequently
  defaultOptions: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours garbage collection
  },
}

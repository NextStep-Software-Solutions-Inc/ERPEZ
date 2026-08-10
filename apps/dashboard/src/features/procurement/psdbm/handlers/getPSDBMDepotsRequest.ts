/**
 * Get PSDBM Depots Request Handler
 * Query blueprint for fetching list of regional depots and LGU locations
 * 
 * Backend proxy endpoint:
 * - GET /api/psdbm/depots
 * 
 * Cached for entire session
 */

import type {
  QueryBlueprintFromTemplate,
  APIResponse,
  QueryKey,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { PSDBMDepot } from '../types'
import { getMockDepotsFallback } from '../utils/psdbmFallback'

const endpoint = '/api/psdbm/depots' as const

export const getPSDBMDepotsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PSDBMDepot[]>,
  undefined,
  QueryKey
> = {
  endpoint,
  key: () => [endpoint] as const,
  fetcher: async ({ finalUrl, signal }) => {
    // Backend proxy endpoint: /api/psdbm/depots
    // Uses configured VITE_ERPEZ_BACKEND_URL from environment
    try {
      const response = await api.get<APIResponse<PSDBMDepot[]>>(finalUrl, { signal })
      return response.data
    } catch (error) {
      // Fallback: If URL doesn't return data, return mock depots
      console.warn('[PSDBM Depots] API request failed, using mock data fallback', error)
      return {
        succeeded: true,
        message: 'Using fallback mock data',
        data: getMockDepotsFallback(),
        errors: {},
      }
    }
  },

  // Cache for entire session - depots don't change during user session
  defaultOptions: {
    staleTime: Infinity, // Never becomes stale during session
    gcTime: 24 * 60 * 60 * 1000, // 24 hours garbage collection
  },
}

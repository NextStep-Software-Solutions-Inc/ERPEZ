/**
 * Get AOB List Request Handler
 * Fetches paginated list of Abstract of Bids with filtering and pagination
 * Falls back to mock data during development
 */

import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'
import type { PaginationResponse } from 'erpez-shared-lib'
import type { AOB } from '../types'
import api from '@/services/api'
import { mockAOBStore } from '../utils/mockAOBStore'

const endpoint = '/procurement/aob'

export interface GetAOBListParams {
  pageNumber?: number
  pageSize?: number
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
    try {
      const response = await api.get<PaginationResponse<AOB>>(finalUrl, { signal })
      return response.data
    } catch (error) {
      // Always throw auth errors (401/403) - never fall back to mock for auth issues
      if (error instanceof Error) {
        const errorMessage = error.message
        if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('Unauthorized')) {
          throw new Error(`Authentication error: ${errorMessage}`)
        }
      }

      // Only fall back to mock data in development for other errors
      if (!import.meta.env.DEV) {
        throw error
      }

      // Log the actual error for debugging in development
      console.warn('API error in development mode, falling back to mock AOB list data:', error)
      return mockAOBStore.getList(1, 10)
    }
  },
}

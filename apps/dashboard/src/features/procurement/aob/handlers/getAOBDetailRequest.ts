/**
 * Get AOB Detail Request Handler
 * Fetches complete AOB details including bid matrix and winners
 * Falls back to mock data during development
 */

import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'
import type { AOBDetail } from '../types/aobTypes'
import api from '@/services/api'
import { MOCK_AOB_DETAIL } from '../utils/mockData'

const endpoint = '/procurement/abstract-of-bids-aob/:id'

export interface GetAOBDetailParams {
  id: string
}

export const getAOBDetailRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  AOBDetail,
  GetAOBDetailParams
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    try {
      const response = await api.get<{ data: AOBDetail }>(finalUrl, { signal })
      return response.data.data
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
      console.warn('API error in development mode, falling back to mock AOB detail data:', error)
      return MOCK_AOB_DETAIL
    }
  },
}

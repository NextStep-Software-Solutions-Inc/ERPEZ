/**
 * Get Bid Matrix Request Handler
 * Fetches the complete bid matrix for an AOB including:
 * - All suppliers and their bid submissions
 * - Line items with bid details
 * - Award criteria and calculations
 * - Winner selections
 * 
 * API-Ready for future backend integration
 */

import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BidMatrix } from '../types/aobTypes'
import api from '@/services/api'
import { MOCK_BID_MATRIX } from '../__mocks__/mockData'

const endpoint = '/procurement/abstract-of-bids-aob/:aobId/bid-matrix'

export interface GetBidMatrixParams {
  aobId: string
}

export const getBidMatrixRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  BidMatrix,
  GetBidMatrixParams
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    try {
      const response = await api.get<{ data: BidMatrix }>(finalUrl, { signal })
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
      console.warn('API error in development mode, falling back to mock bid matrix data:', error)
      return MOCK_BID_MATRIX
    }
  },
}

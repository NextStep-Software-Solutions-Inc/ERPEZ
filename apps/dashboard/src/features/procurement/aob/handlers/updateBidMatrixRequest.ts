/**
 * Update Bid Matrix Request Handler
 * Updates supplier bids in the bid matrix for manual entries and score updates
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BidMatrix, UpdateBidMatrixPayload } from '../types/aobTypes'
import api from '@/services/api'
import { mockAOBStore } from '../utils/mockAOBStore'

const endpoint = '/procurement/abstract-of-bids-aob/:id/bid-matrix'

export interface UpdateBidMatrixParams {
  id: string
}

export const updateBidMatrixRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  BidMatrix,
  UpdateBidMatrixParams,
  Omit<UpdateBidMatrixPayload, 'aobId'>
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    try {
      const response = await api.put<{ data: BidMatrix }>(finalUrl, payload)
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
      console.warn('API error in development mode, falling back to mock update bid matrix:', error)
      // Extract aobId from finalUrl (format: /.../:id/bid-matrix)
      const aobIdMatch = finalUrl.match(/\/(\w+)\/bid-matrix/)
      const aobId = aobIdMatch?.[1] || ''
      return mockAOBStore.updateBidMatrix(aobId, payload as BidMatrix)
    }
  },
}

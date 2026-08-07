/**
 * Select Winner Request Handler
 * Selects the winning supplier for a specific line item
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { Winner, SelectWinnerPayload } from '../types/aobTypes'
import api from '@/services/api'
import { mockAOBStore } from '../utils/mockAOBStore'

const endpoint = '/procurement/abstract-of-bids-aob/:id/select-winner'

export interface SelectWinnerParams {
  id: string
}

export const selectWinnerRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  Winner,
  SelectWinnerParams,
  Omit<SelectWinnerPayload, 'aobId'>
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    try {
      const response = await api.post<{ data: Winner }>(finalUrl, payload)
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
      console.warn('API error in development mode, falling back to mock select winner:', error)
      // Extract aobId from finalUrl (format: /.../:id/select-winner)
      const aobIdMatch = finalUrl.match(/\/(\w+)\/select-winner/)
      const aobId = aobIdMatch?.[1] || ''
      return mockAOBStore.selectWinner(
        aobId,
        payload?.lineItemId || '',
        payload?.supplierId || '',
        payload?.bidId || ''
      )
    }
  },
}

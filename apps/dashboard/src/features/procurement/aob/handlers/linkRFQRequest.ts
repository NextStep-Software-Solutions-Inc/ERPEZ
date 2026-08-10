/**
 * Link RFQ to AOB Request Handler
 * Links a closed RFQ to an AOB and populates line items
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { AOB, LinkRFQPayload } from '../types/aobTypes'
import api from '@/services/api'
import { mockAOBStore } from '../utils/mockAOBStore'

const endpoint = '/procurement/abstract-of-bids-aob/:id/link-rfq'

export interface LinkRFQParams {
  id: string
}

export const linkRFQRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  AOB,
  LinkRFQParams,
  Omit<LinkRFQPayload, 'aobId'>
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    try {
      const response = await api.post<{ data: AOB }>(finalUrl, payload)
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
      console.warn('API error in development mode, falling back to mock link RFQ:', error)
      // Extract aobId from finalUrl (format: /.../:id/link-rfq)
      const aobIdMatch = finalUrl.match(/\/(\w+)\/link-rfq/)
      const aobId = aobIdMatch?.[1] || ''
      return mockAOBStore.linkRFQ(
        aobId,
        payload?.rfqId || '',
        '', // rfqNumber not available in LinkRFQPayload
        payload?.selectedCategories || []
      )
    }
  },
}

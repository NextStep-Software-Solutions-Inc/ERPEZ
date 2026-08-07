/**
 * Submit AOB Request Handler
 * Changes AOB status from DRAFT to FOR_APPROVAL
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { AOB, SubmitAOBPayload } from '../types/aobTypes'
import api from '@/services/api'
import { mockAOBStore } from '../utils/mockAOBStore'

const endpoint = '/procurement/abstract-of-bids-aob/:id/submit'

export interface SubmitAOBParams {
  id: string
}

export const submitAOBRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  AOB,
  SubmitAOBParams,
  Omit<SubmitAOBPayload, 'aobId'>
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
      console.warn('API error in development mode, falling back to mock submit AOB:', error)
      // Extract aobId from finalUrl (format: /.../:id/submit)
      const aobIdMatch = finalUrl.match(/\/(\w+)\/submit/)
      const aobId = aobIdMatch?.[1] || ''
      return mockAOBStore.submit(aobId)
    }
  },
}

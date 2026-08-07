/**
 * Create NTP Request Handler
 * Creates a new Notice to Proceed
 * API-Ready for future backend integration
 */

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { NTP, CreateNTPPayload } from '../types/ntpTypes'
import api from '@/services/api'
import { mockNTPStore } from '../utils/mockNTPStore'

const endpoint = '/procurement/ntp'

export const createNTPRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  NTP,
  undefined,
  CreateNTPPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    try {
      const response = await api.post<{ data: NTP }>(finalUrl, payload)
      return response.data.data
    } catch (error) {
      if (error instanceof Error) {
        const msg = error.message
        if (msg.includes('401') || msg.includes('403') || msg.includes('Unauthorized')) {
          throw new Error(`Authentication error: ${msg}`)
        }
      }
      if (!import.meta.env.DEV) throw error
      console.warn('API error in dev, falling back to mock:', error)
      return mockNTPStore.create(payload)
    }
  },
}

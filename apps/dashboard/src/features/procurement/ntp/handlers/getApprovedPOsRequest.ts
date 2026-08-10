/**
 * Get Approved POs Request Handler
 * Fetches approved Purchase Orders for NTP linking
 * API-Ready for future backend integration
 */

import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'
import type { ApprovedPOForNTP } from '../types/ntpTypes'
import api from '@/services/api'
import { mockNTPStore } from '../utils/mockNTPStore'

const endpoint = '/procurement/po/approved'

export interface GetApprovedPOsParams {
  pageNumber?: number
  pageSize?: number
  searchQuery?: string
}

export const getApprovedPOsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  { data: ApprovedPOForNTP[] },
  GetApprovedPOsParams
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    try {
      const response = await api.get<{ data: ApprovedPOForNTP[] }>(finalUrl, { signal })
      return response.data
    } catch (error) {
      if (error instanceof Error) {
        const msg = error.message
        if (msg.includes('401') || msg.includes('403') || msg.includes('Unauthorized')) {
          throw new Error(`Authentication error: ${msg}`)
        }
      }
      if (!import.meta.env.DEV) throw error
      console.warn('API error in dev, falling back to mock:', error)
      return { data: mockNTPStore.getApprovedPOs() }
    }
  },
}

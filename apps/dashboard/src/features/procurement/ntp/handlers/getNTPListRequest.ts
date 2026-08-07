/**
 * Get NTP List Request Handler
 * Fetches paginated list of NTPs
 * Falls back to mock data during development
 */

import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'
import type { NTPListResponse } from '../types/ntpTypes'
import api from '@/services/api'
import { mockNTPStore } from '../utils/mockNTPStore'

const endpoint = '/procurement/ntp'

export interface GetNTPListParams {
  pageNumber?: number
  pageSize?: number
  status?: string
  searchQuery?: string
}

export const getNTPListRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  NTPListResponse,
  GetNTPListParams
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    try {
      const response = await api.get<NTPListResponse>(finalUrl, { signal })
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
      const params = new URLSearchParams(finalUrl.split('?')[1] ?? '')
      const pageNumber = parseInt(params.get('pageNumber') ?? '1')
      const pageSize = parseInt(params.get('pageSize') ?? '10')
      return mockNTPStore.getList(pageNumber, pageSize)
    }
  },
}

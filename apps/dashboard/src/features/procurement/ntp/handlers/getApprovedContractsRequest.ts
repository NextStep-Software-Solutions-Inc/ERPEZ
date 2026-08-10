/**
 * Get Approved Contracts Request Handler
 * Fetches approved Contracts for NTP linking
 * API-Ready for future backend integration
 */

import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'
import type { ApprovedContractForNTP } from '../types/ntpTypes'
import api from '@/services/api'
import { mockNTPStore } from '../utils/mockNTPStore'

const endpoint = '/procurement/contract/approved'

export interface GetApprovedContractsParams {
  pageNumber?: number
  pageSize?: number
  searchQuery?: string
}

export const getApprovedContractsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  { data: ApprovedContractForNTP[] },
  GetApprovedContractsParams
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    try {
      const response = await api.get<{ data: ApprovedContractForNTP[] }>(finalUrl, { signal })
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
      return { data: mockNTPStore.getApprovedContracts() }
    }
  },
}

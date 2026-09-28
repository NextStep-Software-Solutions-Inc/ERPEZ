/**
 * GET /notice-to-proceed/available-contracts
 * Contracts that are Approved or Executed and do not currently have an active NTP.
 */

import type { APIResponse, QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import api from '@/services/api'
import type { AvailableContractForNoticeToProceed } from '../types/ntpTypes'

const endpoint = '/notice-to-proceed/available-contracts' as const

export const getAvailableContractsForNoticeToProceedRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<AvailableContractForNoticeToProceed[]>,
  undefined,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<AvailableContractForNoticeToProceed[]>>(finalUrl, { signal })
    return response.data
  },
}

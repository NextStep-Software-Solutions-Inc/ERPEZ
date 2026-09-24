/**
 * GET /contracts/summary
 * Retrieve aggregate contract statistics.
 */

import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { ContractSummary } from '../types'

const endpoint = '/contracts/summary' as const

export const getContractSummaryRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ContractSummary>,
  undefined,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<ContractSummary>>(finalUrl, { signal })
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to fetch contract summary.')
    }
    return response.data
  },
}

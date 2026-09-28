/**
 * GET /contracts/available-noas
 * Retrieve approved NOAs eligible for contract creation (not linked to an active contract).
 */

import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { AvailableNoaForContract } from '../types'

const endpoint = '/contracts/available-noas' as const

export const getAvailableNoasForContractRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<AvailableNoaForContract[]>,
  undefined,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<AvailableNoaForContract[]>>(finalUrl, { signal })
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to fetch available NOAs for contract.')
    }
    return response.data
  },
}

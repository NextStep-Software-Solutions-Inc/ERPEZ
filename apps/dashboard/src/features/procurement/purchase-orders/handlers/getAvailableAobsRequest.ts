/**
 * GET /aobs/available-for-po
 * List approved Abstract of Bids ready for PO creation.
 */

import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { AvailableAob } from '../types'

const endpoint = '/aobs/available-for-po' as const

export const getAvailableAobsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  AvailableAob[],
  undefined,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<AvailableAob[]>>(finalUrl, { signal })
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to fetch available AOBs.')
    }
    return response.data.data ?? []
  },
}

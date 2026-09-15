/**
 * GET /notice-of-awards/available-for-po
 * List approved Notice of Awards ready for PO creation.
 */

import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { AvailableNoa } from '../types'

const endpoint = '/notice-of-awards/available-for-po' as const

export const getAvailableNoasRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  AvailableNoa[],
  undefined,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<AvailableNoa[]>>(finalUrl, { signal })
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to fetch available NOAs.')
    }
    return response.data.data ?? []
  },
}

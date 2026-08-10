/**
 * GET /purchase-requests/{id}
 * Fetch a single purchase request with its full item list.
 */

import type {
  QueryBlueprintFromTemplate,
  APIResponse,
  QueryKey,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { PurchaseRequestDetailApi } from '../types/apiTypes'

const endpoint = '/purchase-requests/:id' as const

export const getPurchaseRequestRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PurchaseRequestDetailApi>,
  undefined,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl }) => {
    const response = await api.get<APIResponse<PurchaseRequestDetailApi>>(finalUrl)
    return response.data
  },
}

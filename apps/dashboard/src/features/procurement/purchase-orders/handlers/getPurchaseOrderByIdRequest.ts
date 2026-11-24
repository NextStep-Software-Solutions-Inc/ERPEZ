/**
 * GET /purchase-orders/:id
 * Retrieve a single Purchase Order by ID.
 */

import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { PurchaseOrder } from '../types'

const endpoint = '/purchase-orders/:id' as const

export const getPurchaseOrderByIdRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PurchaseOrder>,
  undefined,
  QueryKey,
  { id: string }
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<PurchaseOrder>>(finalUrl, { signal })
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to fetch Purchase Order.')
    }
    return response.data
  },
}

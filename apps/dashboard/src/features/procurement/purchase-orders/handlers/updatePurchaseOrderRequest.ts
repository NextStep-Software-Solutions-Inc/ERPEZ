/**
 * PUT /purchase-orders/:id
 * Update a draft Purchase Order header details.
 */

import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { UpdatePurchaseOrderRequest } from '../types'

const endpoint = '/purchase-orders/:id' as const

export const updatePurchaseOrderRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean>,
  { id: string },
  UpdatePurchaseOrderRequest
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<boolean>>(finalUrl, payload)
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to update Purchase Order.')
    }
    return response.data
  },
}

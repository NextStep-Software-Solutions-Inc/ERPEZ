/**
 * POST /purchase-orders/:id/return
 * Return a Purchase Order back to draft with reason.
 */

import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { ReturnPurchaseOrderRequest } from '../types'

const endpoint = '/purchase-orders/:id/return' as const

export const returnPurchaseOrderRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean>,
  { id: string },
  ReturnPurchaseOrderRequest
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<boolean>>(finalUrl, payload)
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to return Purchase Order.')
    }
    return response.data
  },
}

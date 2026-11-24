/**
 * POST /purchase-orders/:id/approve
 * Approve a submitted Purchase Order.
 */

import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/purchase-orders/:id/approve' as const

export const approvePurchaseOrderRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean>,
  { id: string },
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<boolean>>(finalUrl)
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to approve Purchase Order.')
    }
    return response.data
  },
}

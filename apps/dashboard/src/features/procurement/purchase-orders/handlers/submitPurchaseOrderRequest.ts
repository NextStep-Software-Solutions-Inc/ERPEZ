/**
 * POST /purchase-orders/:id/submit
 * Submit a draft Purchase Order for HOPE review / approval.
 */

import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/purchase-orders/:id/submit' as const

export const submitPurchaseOrderRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean>,
  { id: string },
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<boolean>>(finalUrl)
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to submit Purchase Order for approval.')
    }
    return response.data
  },
}

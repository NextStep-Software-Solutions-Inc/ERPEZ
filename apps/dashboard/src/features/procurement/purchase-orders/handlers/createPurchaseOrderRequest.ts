/**
 * POST /purchase-orders
 * Create a new Purchase Order with auto-fill from source document.
 */

import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { CreatePurchaseOrderRequest } from '../types'

const endpoint = '/purchase-orders' as const

export const createPurchaseOrderRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  CreatePurchaseOrderRequest
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<string>>(finalUrl, payload)
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to create Purchase Order.')
    }
    return response.data
  },
}

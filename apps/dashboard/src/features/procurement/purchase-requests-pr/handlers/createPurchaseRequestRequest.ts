/**
 * POST /purchase-requests
 * Create a new Purchase Request (header only – items are added via PUT).
 * Returns the new PR's UUID on success.
 */

import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'
import type { CreatePurchaseRequestPayload } from '../types/apiTypes'

const endpoint = '/purchase-requests' as const

export const createPurchaseRequestRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  CreatePurchaseRequestPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) throw new Error('createPurchaseRequestRequest: payload is required')
    const response = await api.post<APIResponse<string>>(finalUrl, payload)
    return response.data
  },
}

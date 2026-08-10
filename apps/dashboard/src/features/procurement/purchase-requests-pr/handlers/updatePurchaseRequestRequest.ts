/**
 * PUT /purchase-requests/{id}
 * Full update of a PR including its items array.
 * Call this whenever items are added, removed, or quantities edited.
 */

import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'
import type {
  UpdatePurchaseRequestPayload,
  PurchaseRequestDetailApi,
} from '../types/apiTypes'

const endpoint = '/purchase-requests/:id' as const

export const updatePurchaseRequestRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PurchaseRequestDetailApi>,
  { id: string },
  UpdatePurchaseRequestPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) throw new Error('updatePurchaseRequestRequest: payload is required')
    const response = await api.put<APIResponse<PurchaseRequestDetailApi>>(finalUrl, payload)
    return response.data
  },
}

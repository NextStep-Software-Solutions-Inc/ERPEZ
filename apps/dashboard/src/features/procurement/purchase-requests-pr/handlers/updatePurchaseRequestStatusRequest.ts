/**
 * PATCH /purchase-requests/{id}/status
 * Transition a PR to a new status (Submit, Approve, Return).
 *
 * Status transitions:
 *   Draft  → Submitted  (office staff submits for review)
 *   Submitted → Approved (approving authority approves)
 *   Submitted → Returned (approving authority returns with remarks)
 *   Returned  → Submitted (office staff re-submits after corrections)
 *
 * NOTE: "Approve" will require a signed PDF URL once the file-upload API is available.
 * For now only the status change is sent.
 */

import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'
import type { UpdatePurchaseRequestStatusPayload } from '../types/apiTypes'

const endpoint = '/purchase-requests/:id/status' as const

export const updatePurchaseRequestStatusRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Record<string, never>>,
  { id: string },
  UpdatePurchaseRequestStatusPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) throw new Error('updatePurchaseRequestStatusRequest: payload is required')
    const response = await api.patch<APIResponse<Record<string, never>>>(finalUrl, payload)
    return response.data
  },
}

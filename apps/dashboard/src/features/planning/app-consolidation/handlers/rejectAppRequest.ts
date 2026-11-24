/**
 * rejectAppRequest
 * Returns an APP to Draft (Submitted → Returned) with an optional reason.
 * Delegates to the real PATCH /apps/{id}/status endpoint.
 */

import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/apps/:appId/status' as const

interface RejectAppPayload {
  appId: string
  reason: string
}

interface RejectAppResult {
  id: string
  status: string
}

export const rejectAppRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  RejectAppResult,
  undefined,
  RejectAppPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) throw new Error('Payload is required')
    const response = await api.patch<APIResponse<RejectAppResult>>(finalUrl, {
      status: 'Returned',
      remarks: payload.reason,
    })
    return response.data.data
  },
}

/**
 * returnAPPRequest
 * Returns an APP for revision (Submitted → Returned) with a reason.
 * Alias for rejectAppRequest — delegates to the real PATCH /apps/{id}/status endpoint.
 */

import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/apps/:appId/status' as const

interface ReturnAPPPayload {
  appId: string
  returnReason: string
}

interface ReturnAPPResult {
  id: string
  status: string
}

export const returnAPPRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  ReturnAPPResult,
  undefined,
  ReturnAPPPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) throw new Error('Payload is required')
    const response = await api.patch<APIResponse<ReturnAPPResult>>(finalUrl, {
      status: 'Returned',
      remarks: payload.returnReason,
    })
    return response.data.data
  },
}

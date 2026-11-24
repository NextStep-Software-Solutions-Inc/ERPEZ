/**
 * submitAPPForReviewRequest
 * Submits an APP for review (Draft/Returned → Submitted).
 * Delegates to changeAPPStatusRequest — kept for backward compatibility.
 */

import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/apps/:appId/status' as const

interface SubmitAPPPayload {
  appId: string
}

interface SubmitAPPResult {
  id: string
  status: string
}

export const submitAPPForReviewRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  SubmitAPPResult,
  undefined,
  SubmitAPPPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) throw new Error('Payload is required')
    const response = await api.patch<APIResponse<SubmitAPPResult>>(finalUrl, {
      status: 'Submitted',
    })
    return response.data.data
  },
}

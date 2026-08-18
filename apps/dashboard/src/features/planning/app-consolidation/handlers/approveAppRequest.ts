/**
 * approveAppRequest
 * Approves an APP (Submitted → Approved, or optionally Approved → Locked).
 * Delegates to the real PATCH /apps/{id}/status endpoint.
 */

import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'
import type { AppApprovalFormValues } from '../types'

const endpoint = '/apps/:appId/status' as const

interface ApproveAppPayload extends AppApprovalFormValues {
  appId: string
}

interface ApproveAppResult {
  id: string
  status: string
}

export const approveAppRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  ApproveAppResult,
  undefined,
  ApproveAppPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) throw new Error('Payload is required')
    // setAsFinal = true → Locked, otherwise → Approved
    const nextStatus = payload.setAsFinal ? 'Locked' : 'Approved'
    const response = await api.patch<APIResponse<ApproveAppResult>>(finalUrl, {
      status: nextStatus,
      remarks: payload.remarks,
    })
    return response.data.data
  },
}

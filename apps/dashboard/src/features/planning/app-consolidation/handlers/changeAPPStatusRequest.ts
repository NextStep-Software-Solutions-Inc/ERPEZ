/**
 * changeAPPStatusRequest
 * Single canonical handler for all APP status transitions.
 *
 * Endpoint: PATCH /apps/{id}/status
 * Body:     { status: AppStatus }
 *
 * Replaces all the individual mock submit/approve/reject/return handlers.
 * The caller is responsible for passing the correct next status value.
 *
 * Transitions (enforced by the backend):
 *   Draft | Returned  → Submitted   (Submit for Review)
 *   Submitted         → Approved    (Approve)
 *   Submitted         → Returned    (Return / Reject)
 *   Approved          → Locked      (Lock as Final)
 */

import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'
import type { AppStatus } from '../types'

const endpoint = '/apps/:appId/status' as const

export interface ChangeAPPStatusPayload {
  appId: string
  status: AppStatus
  remarks?: string
}

export interface ChangeAPPStatusResult {
  id: string
  status: AppStatus
}

export const changeAPPStatusRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  ChangeAPPStatusResult,
  undefined,
  ChangeAPPStatusPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) throw new Error('Payload is required')
    const response = await api.patch<APIResponse<ChangeAPPStatusResult>>(finalUrl, {
      status: payload.status,
      remarks: payload.remarks,
    })
    return response.data.data
  },
}

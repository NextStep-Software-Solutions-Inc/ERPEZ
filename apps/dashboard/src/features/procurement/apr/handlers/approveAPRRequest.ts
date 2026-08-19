/**
 * Approve APR Request Handler
 * Mutation blueprint for approving APR via PATCH /aprs/:aprId/status
 */

import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { APRStatus, type ApproveAPRPayload } from '../types'

const endpoint = '/aprs/:aprId/status' as const

export const approveAPRRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  ApproveAPRPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.patch<APIResponse<string>>(finalUrl, {
      status: APRStatus.APPROVED,
      remarks: payload?.approvedAt ? `Approved at ${payload.approvedAt}` : null,
    })
    return response.data
  },
}

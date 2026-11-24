/**
 * Return APR Request Handler
 * Mutation blueprint for returning APR with remarks via PATCH /aprs/:aprId/status
 */

import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { APRStatus, type ReturnAPRPayload } from '../types'

const endpoint = '/aprs/:aprId/status' as const

export const returnAPRRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  ReturnAPRPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload?.remarks) {
      throw new Error('Return remarks are required')
    }
    const response = await api.patch<APIResponse<string>>(finalUrl, {
      status: APRStatus.RETURNED,
      remarks: payload.remarks,
    })
    return response.data
  },
}

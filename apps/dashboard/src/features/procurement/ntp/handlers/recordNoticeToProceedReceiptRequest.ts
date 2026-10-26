/**
 * POST /notice-to-proceed/{id}/record-receipt
 * Record contractor's receipt (conforme) of the NTP.
 */

import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'
import type { RecordNoticeToProceedReceiptRequest } from '../types/ntpTypes'

const endpoint = '/notice-to-proceed/:id/record-receipt' as const

export const recordNoticeToProceedReceiptRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  { id: string; payload: RecordNoticeToProceedReceiptRequest }
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<string>>(finalUrl, payload.payload)
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to record Notice to Proceed receipt.')
    }
    return response.data
  },
}

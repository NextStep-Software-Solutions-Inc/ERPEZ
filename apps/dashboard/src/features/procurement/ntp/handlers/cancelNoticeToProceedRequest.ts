/**
 * POST /notice-to-proceed/{id}/cancel
 * Cancel an NTP with mandatory reason.
 */

import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'
import type { CancelNoticeToProceedRequest } from '../types/ntpTypes'

const endpoint = '/notice-to-proceed/:id/cancel' as const

export const cancelNoticeToProceedRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  { id: string; payload: CancelNoticeToProceedRequest }
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<string>>(finalUrl, payload.payload)
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to cancel Notice to Proceed.')
    }
    return response.data
  },
}

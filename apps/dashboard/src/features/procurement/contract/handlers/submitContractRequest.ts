/**
 * POST /contracts/:id/submit
 * Submit a Draft or Returned Contract for internal review.
 */

import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/contracts/:id/submit' as const

export const submitContractRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean>,
  { id: string },
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<boolean>>(finalUrl)
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to submit Contract.')
    }
    return response.data
  },
}

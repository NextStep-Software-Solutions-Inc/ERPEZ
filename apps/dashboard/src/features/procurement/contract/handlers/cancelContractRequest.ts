/**
 * POST /contracts/:id/cancel
 * Cancel an active Contract (frees linked NOA for re-contracting).
 */

import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/contracts/:id/cancel' as const

export const cancelContractRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean>,
  { id: string },
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<boolean>>(finalUrl)
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to cancel Contract.')
    }
    return response.data
  },
}

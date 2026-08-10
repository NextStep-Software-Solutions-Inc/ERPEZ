/**
 * DELETE /consolidated-prs/{id}/prs/{purchaseRequestId}
 * Remove a single PR from a Consolidated PR.
 */

import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/consolidated-prs/:id/prs/:purchaseRequestId' as const

export const removePrFromConsolidatedPrRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Record<string, never>>,
  { id: string; purchaseRequestId: string },
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<APIResponse<Record<string, never>>>(finalUrl)
    return response.data
  },
}

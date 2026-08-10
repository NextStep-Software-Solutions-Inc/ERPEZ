/**
 * DELETE /purchase-requests/{id}
 * Hard-delete a PR. Only allowed for PRs in Draft status.
 */

import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/purchase-requests/:id' as const

export const deletePurchaseRequestRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Record<string, never>>,
  { id: string },
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<APIResponse<Record<string, never>>>(finalUrl)
    return response.data
  },
}

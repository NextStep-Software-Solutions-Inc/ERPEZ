/**
 * DELETE /contracts/:id
 * Soft-delete a Contract in Draft or Returned status.
 */

import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/contracts/:id' as const

export const deleteContractRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean>,
  { id: string },
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<APIResponse<boolean>>(finalUrl)
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to delete Contract.')
    }
    return response.data
  },
}

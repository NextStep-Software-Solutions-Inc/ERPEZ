/**
 * DELETE /notice-to-proceed/{id}
 * Soft delete a Draft NTP.
 */

import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/notice-to-proceed/:id' as const

export const deleteNoticeToProceedRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  { id: string }
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<APIResponse<string>>(finalUrl)
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to delete Notice to Proceed.')
    }
    return response.data
  },
}

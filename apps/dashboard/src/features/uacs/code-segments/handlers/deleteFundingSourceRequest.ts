/**
 * Delete Funding Source Request
 * Deletes a funding source via DELETE /fund-sources/{id}
 * 
 * API Endpoint: DELETE /fund-sources/{id}
 */
import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/fund-sources/:id'

export const deleteFundingSourceRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  { id: string },
  { id: string },
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<APIResponse<{ id: string }>>(finalUrl)
    return response.data.data
  },
}

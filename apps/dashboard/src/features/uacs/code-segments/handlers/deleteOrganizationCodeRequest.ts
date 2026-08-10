/**
 * Delete Organization Code Request
 * Deletes an organization code via DELETE /organizations/{id}
 * 
 * API Endpoint: DELETE /organizations/{id}
 */
import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/organizations/:id'

export const deleteOrganizationCodeRequest: MutationBlueprintFromTemplate<
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

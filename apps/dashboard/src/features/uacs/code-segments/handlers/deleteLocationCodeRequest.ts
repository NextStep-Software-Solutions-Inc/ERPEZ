/**
 * Delete Location Code Request
 * Deletes a location code via DELETE /locations/{id}
 * 
 * API Endpoint: DELETE /locations/{id}
 */
import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/locations/:id'

export const deleteLocationCodeRequest: MutationBlueprintFromTemplate<
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

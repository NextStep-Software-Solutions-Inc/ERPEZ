/**
 * Update Location Code Request
 * Updates an existing location code via PUT /locations/{id}
 * 
 * API Endpoint: PUT /locations/{id}
 * Validation Rules:
 * - Code: Must be exactly 9 digits (read-only in update)
 * - Name: Min 2 characters
 */
import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import type { LocationCode, UpdateLocationCodePayload } from '../types/locationCodeTypes'
import api from '@/services/api'

const endpoint = '/locations/:id'

export const updateLocationCodeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  LocationCode,
  { id: string },
  UpdateLocationCodePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<LocationCode>>(finalUrl, payload)
    return response.data.data
  },
}

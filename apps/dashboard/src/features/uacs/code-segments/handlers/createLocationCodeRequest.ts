/**
 * Create Location Code Request
 * Creates a new location code via POST /locations
 * 
 * API Endpoint: POST /locations
 * Validation Rules:
 * - Code: Must be exactly 9 digits
 * - Name: Required, min 2 characters
 */
import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import type { LocationCode, CreateLocationCodePayload } from '../types/locationCodeTypes'
import api from '@/services/api'

const endpoint = '/locations'

export const createLocationCodeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  LocationCode,
  undefined,
  CreateLocationCodePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<LocationCode>>(finalUrl, payload)
    return response.data.data
  },
}

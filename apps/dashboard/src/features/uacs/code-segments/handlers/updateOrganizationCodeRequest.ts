/**
 * Update Organization Code Request
 * Updates an existing organization code via PUT /organizations/{id}
 * 
 * API Endpoint: PUT /organizations/{id}
 * Validation Rules:
 * - Code: Must be exactly 12 digits (read-only in update)
 * - Name: Min 2 characters
 * - Type: Required
 */
import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import type { OrganizationCode, UpdateOrganizationCodePayload } from '../types/organizationCodeTypes'
import api from '@/services/api'

const endpoint = '/organizations/:id'

export const updateOrganizationCodeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  OrganizationCode,
  { id: string },
  UpdateOrganizationCodePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<OrganizationCode>>(finalUrl, payload)
    return response.data.data
  },
}

/**
 * Create Organization Code Request
 * Creates a new organization code via POST /organizations
 * 
 * API Endpoint: POST /organizations
 * Validation Rules:
 * - Code: Must be exactly 12 digits
 * - Name: Required, min 2 characters
 * - Type: Required (e.g., Department, Division, Section)
 */
import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import type { OrganizationCode, CreateOrganizationCodePayload } from '../types/organizationCodeTypes'
import api from '@/services/api'

const endpoint = '/organizations'

export const createOrganizationCodeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  OrganizationCode,
  undefined,
  CreateOrganizationCodePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<OrganizationCode>>(finalUrl, payload)
    return response.data.data
  },
}

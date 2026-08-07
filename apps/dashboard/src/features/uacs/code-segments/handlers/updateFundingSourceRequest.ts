/**
 * Update Funding Source Request
 * Updates an existing funding source via PUT /fund-sources/{id}
 * 
 * API Endpoint: PUT /fund-sources/{id}
 * Validation Rules:
 * - Code: Max 5 characters
 * - Type: Must be one of: Fund Cluster, Financing Source, Authorization Code, Fund Category, Fund Sub Category
 */
import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import type { FundingSource, UpdateFundingSourcePayload } from '../types/fundingSourceTypes'
import api from '@/services/api'

const endpoint = '/fund-sources/:id'

export const updateFundingSourceRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  FundingSource,
  { id: string },
  UpdateFundingSourcePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<FundingSource>>(finalUrl, payload)
    return response.data.data
  },
}

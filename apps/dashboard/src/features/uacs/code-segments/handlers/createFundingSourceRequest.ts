/**
 * Create Funding Source Request
 * Creates a new funding source via POST /fund-sources
 * 
 * API Endpoint: POST /fund-sources
 * Validation Rules:
 * - Code: Max 5 characters
 * - Type: Must be one of: Fund Cluster, Financing Source, Authorization Code, Fund Category, Fund Sub Category
 */
import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import type { FundingSource, CreateFundingSourcePayload } from '../types/fundingSourceTypes'
import api from '@/services/api'

const endpoint = '/fund-sources'

export const createFundingSourceRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  FundingSource,
  undefined,
  CreateFundingSourcePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<FundingSource>>(finalUrl, payload)
    return response.data.data
  },
}

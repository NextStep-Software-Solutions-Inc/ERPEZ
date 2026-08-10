/**
 * Get Funding Sources Request
 * Fetches paginated list of funding source codes
 * 
 * API Endpoint: GET /fund-sources (from erpez-swagger.json)
 * Response Type: PaginationResponse<FundingSource>
 */
import type { QueryBlueprintFromTemplate, QueryKey, PaginationResponse, QueryParams } from 'erpez-shared-lib'
import type { FundingSource } from '../types/fundingSourceTypes'
import api from '@/services/api'

const endpoint = '/fund-sources'

export const getFundingSourcesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<FundingSource>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<FundingSource>>(finalUrl, { signal })
    return response.data
  },
}

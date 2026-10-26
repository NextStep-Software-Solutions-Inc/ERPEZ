/**
 * Get all Market Scoping Forms for current user
 * Query handler using factory pattern
 * Location: src/features/planning/market-scoping/handlers/
 */

import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
  APIResponse,
} from 'erpez-shared-lib'
import type { ListMarketScopingResponse } from '../types/marketScopingApiTypes'
import type { MarketScopingForm } from '../types/marketScopingTypes'
import api from '@/services/api'

const endpoint = '/market-scopings' as const

interface GetMarketScopingsParams extends QueryParams {
  pageNumber?: number
  pageSize?: number
  filters?: string
  sorts?: string
}

export type MarketScopingsApiResponse = APIResponse<
  ListMarketScopingResponse | MarketScopingForm[]
> & {
  totalCount?: number
  totalPages?: number
  pageNumber?: number
  pageSize?: number
}

export const getMarketScopingsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  MarketScopingsApiResponse,
  GetMarketScopingsParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<MarketScopingsApiResponse>(
      finalUrl,
      { signal },
    )
    return response.data
  },
}

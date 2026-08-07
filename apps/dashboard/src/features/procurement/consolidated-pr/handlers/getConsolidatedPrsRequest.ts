/**
 * GET /consolidated-prs
 * Paginated list of consolidated purchase requests.
 */

import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
  PaginationResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { ConsolidatedPR } from '../types/apiTypes'

const endpoint = '/consolidated-prs' as const

export interface GetConsolidatedPrsParams extends QueryParams {
  PageNumber?: number
  PageSize?: number
  Filters?: string
  Sorts?: string
}

export const getConsolidatedPrsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<ConsolidatedPR>,
  GetConsolidatedPrsParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl }) => {
    const response = await api.get<PaginationResponse<ConsolidatedPR>>(finalUrl)
    return response.data
  },
}

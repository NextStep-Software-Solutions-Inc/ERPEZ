/**
 * Get APR List Request Handler
 * Query blueprint for fetching all APRs with pagination and optional filtering
 * Connects directly to backend GET /aprs
 */

import type {
  QueryBlueprintFromTemplate,
  PaginationResponse,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { APRListItemDto } from '../types'

const endpoint = '/aprs' as const

export interface GetAPRsParams extends QueryParams {
  PageNumber?: number
  PageSize?: number
  Filters?: string
  Sorts?: string
  status?: string
  fiscalYear?: number
  sourceAPPId?: string
}

export const getAPRsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<APRListItemDto>,
  GetAPRsParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<APRListItemDto>>(finalUrl, { signal })
    return response.data
  },
}

import {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { ResolutionClause } from '../types'

const endpoint = '/resolution-clauses'

export const getResolutionClausesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<ResolutionClause>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<ResolutionClause>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

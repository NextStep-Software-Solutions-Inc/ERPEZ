import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  PaginationResponse,
  QueryParams,
} from 'erpez-shared-lib'
import type { Position } from '../table/types'
import api from '@/services/api'

const endpoint = '/positions'

export const getPositionsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<Position>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<Position>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

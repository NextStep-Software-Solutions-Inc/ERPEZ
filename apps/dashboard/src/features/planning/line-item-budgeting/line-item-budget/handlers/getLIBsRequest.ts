import {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import { LIB } from '../types'
import api from '@/services/api'

const endpoint = '/libs'
export const getLIBsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<LIB>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url, queryParams }) => [url, queryParams],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<LIB>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
  PaginationResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { Object } from '../types/types'

const endpoint = '/objects'

export const getObjectsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<Object>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url, queryParams }) => [url, queryParams],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<Object>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

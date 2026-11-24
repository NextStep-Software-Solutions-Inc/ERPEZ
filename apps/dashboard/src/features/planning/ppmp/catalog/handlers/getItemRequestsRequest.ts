import {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { ItemRequest } from '../types/catalog.types'

const endpoint = '/item-requests'

export const getItemRequestsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<ItemRequest>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<ItemRequest>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

import {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { ItemRequest } from '../types/catalog.types'

const endpoint = '/item-requests/:id'

export const getItemRequestByIdRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ItemRequest>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<ItemRequest>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

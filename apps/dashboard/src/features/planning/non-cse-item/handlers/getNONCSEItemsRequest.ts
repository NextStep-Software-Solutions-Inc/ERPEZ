import {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import { NONCSEItem } from '../types/non-cse.type'
import api from '@/services/api'

const endpoint = '/non-cse-items'
export const getNONCSEItemsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<NONCSEItem>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<NONCSEItem>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

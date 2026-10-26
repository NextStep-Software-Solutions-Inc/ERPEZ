import {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import { NONCSEItem } from '../types/non-cse.type'
import api from '@/services/api'

export interface NonCSEQueryParams extends QueryParams {
  search?: string
  category?: string
}

const endpoint = '/non-cse-items'
export const getNONCSEItemsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<NONCSEItem>,
  NonCSEQueryParams,
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


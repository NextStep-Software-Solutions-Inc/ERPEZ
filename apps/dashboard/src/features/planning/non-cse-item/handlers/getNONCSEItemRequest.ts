import {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { NONCSEItemDetails } from '../types/non-cse.type'

const endpoint = '/non-cse-items/:id'

export const getNONCSEItemRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<NONCSEItemDetails>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<NONCSEItemDetails>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

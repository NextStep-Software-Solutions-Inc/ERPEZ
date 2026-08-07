import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { UOMApiItem } from '../types'

const endpoint = '/uoms'

export const getUOMsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<UOMApiItem>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<UOMApiItem>>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

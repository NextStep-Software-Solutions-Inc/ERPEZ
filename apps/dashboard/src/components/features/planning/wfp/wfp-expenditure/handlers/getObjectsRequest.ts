import type { Objects } from '../table/types'
import type {
  APIResponse,
  QueryParams,
  QueryBlueprintFromTemplate,
  QueryKey,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/objects'

export const getObjectsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<Objects>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url, queryParams }) => [url, queryParams],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<Objects>>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

import type { Objects } from '../table/types'
import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type {
  APIResponse,
  QueryParams,
} from 'erpez-shared-lib/dist/types/Blueprint'
import api from '@/services/api'

const endpoint = '/objects'

export const getObjectChildrenRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<Objects>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<Objects>>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
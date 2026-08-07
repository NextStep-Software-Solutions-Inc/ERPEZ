import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type {
  APIResponse,
  QueryParams,
} from 'erpez-shared-lib/dist/types/Blueprint'
import type { Cluster } from '../table/types'
import api from '@/services/api'

const endpoint = '/clusters'

export const getClustersRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<Cluster>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<Cluster>>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

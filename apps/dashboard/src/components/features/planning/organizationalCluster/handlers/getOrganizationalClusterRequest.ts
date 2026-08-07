import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { Cluster } from '../table/types'
import type {
  APIResponse,
  QueryParams,
} from 'erpez-shared-lib/dist/types/Blueprint'
import api from '@/services/api'

const endpoint = '/clusters/:id'

export const getOrganizationalClusterRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Cluster>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Cluster>>(finalUrl, { signal })
    return response.data
  },
}

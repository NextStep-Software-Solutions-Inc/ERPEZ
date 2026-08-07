import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import type { DUAllocationStats } from '../table/types'
import api from '@/services/api'

const endpoint = '/du-allocations/stats'

export const getDUAllocationStatsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<DUAllocationStats>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: ({ finalUrl, signal }) => {
    const response = api.get<APIResponse<DUAllocationStats>>(finalUrl, {
      signal,
    })
    return response.then((res) => res.data)
  },
}

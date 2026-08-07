import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import type { DUAllocationDetails } from '../table/types'
import api from '@/services/api'

const endpoint = '/du-allocations/:id'

export const getDUAllocationRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<DUAllocationDetails>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<DUAllocationDetails>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

import type { APIResponse, QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams } from 'erpez-shared-lib'

import type { DUAllocation } from '../table/types'
import api from '@/services/api'

const endpoint = '/du-allocations'

export const getDUAllocationsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<DUAllocation>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<DUAllocation>>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

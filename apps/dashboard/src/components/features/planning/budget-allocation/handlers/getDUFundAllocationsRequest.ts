import type { APIResponse, QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams } from 'erpez-shared-lib'

import type { DUFundAllocation } from '../table/types'
import api from '@/services/api'

const endpoint = '/du-fund-allocations'

export const getDUFundAllocationsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<DUFundAllocation>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<DUFundAllocation>>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

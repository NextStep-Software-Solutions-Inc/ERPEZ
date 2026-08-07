import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { SDG } from '../types'

import type {
  APIResponse,
  QueryParams,
} from 'erpez-shared-lib/dist/types/Blueprint'
import api from '@/services/api'

const endpoint = '/sdgs'

export const getSDGsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Array<SDG>>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  queryParams: { pageSize: 50, PageSize: 50 },
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Array<SDG>>>(finalUrl, {
      signal,
    })
    return response.data
  },
}


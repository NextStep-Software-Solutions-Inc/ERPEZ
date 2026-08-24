import type { PaginationResponse, QueryBlueprintFromTemplate, QueryKey, QueryParams } from 'erpez-shared-lib'
import type { BacProject } from '../types'
import api from '@/services/api'

const endpoint = '/bac/projects'

export const getBacResolutionsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<BacProject>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<BacProject>>(finalUrl, {
      signal,
    })
    return response.data
  },
}


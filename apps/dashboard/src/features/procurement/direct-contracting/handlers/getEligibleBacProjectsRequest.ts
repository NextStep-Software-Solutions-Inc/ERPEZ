import type { PaginationResponse, QueryBlueprintFromTemplate, QueryKey, QueryParams } from 'erpez-shared-lib'
import type { BacProject } from '@/features/procurement/bac-resolution/types'
import api from '@/services/api'

const endpoint = '/bac/projects/eligible-for-direct-contracting'

export const getEligibleBacProjectsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<BacProject>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => ['eligible-bac-projects-for-direct-contracting', url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<BacProject>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

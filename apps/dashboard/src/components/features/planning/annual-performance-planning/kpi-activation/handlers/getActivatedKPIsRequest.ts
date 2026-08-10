import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { ActivatedKPI } from '@/features/planning/annual-performance-planning/appTypes'
import type { QueryParams, PaginationResponse } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/kpis/activated'

export const getActivatedKPIsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<ActivatedKPI>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<ActivatedKPI>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

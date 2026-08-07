import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { KPITarget } from '@/features/planning/annual-performance-planning/appTypes'
import type { QueryParams, PaginationResponse } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/kpi-targets'

export const getKPITargetsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<KPITarget>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<KPITarget>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { KPI } from '../types'
import type {
  APIResponse,
  QueryParams,
} from 'erpez-shared-lib/dist/types/Blueprint'
import api from '@/services/api'

const endpoint = '/fy-active-kpis/:id'

export const getKpiRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<KPI>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<KPI>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

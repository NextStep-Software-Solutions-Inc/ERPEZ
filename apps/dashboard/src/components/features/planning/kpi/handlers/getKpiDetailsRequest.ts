import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { KPIDetails } from '../types'
import type {
  APIResponse,
  QueryParams,
} from 'erpez-shared-lib/dist/types/Blueprint'
import api from '@/services/api'

const endpoint = '/kpis/:id'

export const getKpiDetailsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<KPIDetails>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url, 'details'],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<KPIDetails>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

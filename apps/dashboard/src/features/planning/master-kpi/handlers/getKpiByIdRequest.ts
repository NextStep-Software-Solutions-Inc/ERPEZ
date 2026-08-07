import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
} from 'erpez-shared-lib'
import type { KpiDetailResponse } from '../types'
import api from '@/services/api'

const endpoint = '/kpis/:id'

export const getKpiByIdRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<KpiDetailResponse>,
  Record<string, never>,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<KpiDetailResponse>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

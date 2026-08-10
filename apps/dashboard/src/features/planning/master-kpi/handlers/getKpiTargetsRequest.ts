import type {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import type { KPITarget } from '../types'
import api from '@/services/api'

const endpoint = '/kpi-targets'

export const getKpiTargetsRequest: QueryBlueprintFromTemplate<
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

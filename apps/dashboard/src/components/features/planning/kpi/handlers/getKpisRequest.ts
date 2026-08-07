import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { KPI } from '../types'
import type {
  PaginationResponse,
  QueryParams,
} from 'erpez-shared-lib/dist/types/Blueprint'
import api from '@/services/api'

const endpoint = '/kpis'
export const getKpisRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<KPI>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<KPI>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

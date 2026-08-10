import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { QueryParams, PaginationResponse } from 'erpez-shared-lib'
import api from '@/services/api'

interface KPI {
  id: string
  name: string
  code: string
  description?: string
  isAvailableForShopping: boolean
}

const endpoint = '/kpis/available'

export const getAvailableKPIsRequest: QueryBlueprintFromTemplate<
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

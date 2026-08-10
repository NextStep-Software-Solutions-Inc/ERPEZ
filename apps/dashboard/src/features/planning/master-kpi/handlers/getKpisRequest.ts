import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { PaginationResponse, QueryParams } from 'erpez-shared-lib'
import api from '@/services/api'
import { MasterKPI } from '../types'

const endpoint = '/kpis'
export const getKpisRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<MasterKPI>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<MasterKPI>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

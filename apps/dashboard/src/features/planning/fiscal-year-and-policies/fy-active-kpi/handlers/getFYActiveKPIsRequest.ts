import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  PaginationResponse,
  QueryParams,
} from 'erpez-shared-lib'

import api from '@/services/api'
import { FYActiveKPI } from '../types/types'
const endpoint = '/fy-active-kpis'

export const getFYActiveKPIsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<FYActiveKPI>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<FYActiveKPI>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

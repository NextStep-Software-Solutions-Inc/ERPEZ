import type { PaginationResponse, QueryBlueprintFromTemplate, QueryParams, QueryKey } from 'erpez-shared-lib'
import type { FiscalMonth } from '../../types'
import api from '@/services/api'

const endpoint = '/fiscal-months'

export const getFiscalMonthsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<FiscalMonth>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<FiscalMonth>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

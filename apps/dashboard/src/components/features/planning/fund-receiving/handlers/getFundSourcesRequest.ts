import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { FundSource } from '../../fund-source/table/types'
import type { PaginationResponse, QueryParams } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/fund-sources'

export const getFundSourcesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<FundSource>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<FundSource>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

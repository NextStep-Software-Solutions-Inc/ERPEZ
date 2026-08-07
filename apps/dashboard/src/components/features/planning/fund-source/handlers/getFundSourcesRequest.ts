import type {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import type { FundSource } from '../table/types'
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

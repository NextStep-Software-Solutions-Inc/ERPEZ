import type { APIResponse, QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type { FundSource } from '../table/types'
import type { QueryParams } from 'erpez-shared-lib/dist/types/Blueprint'
import api from '@/services/api'

const endpoint = '/fund-sources/:id'

export const getFundSourceRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<FundSource>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<FundSource>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

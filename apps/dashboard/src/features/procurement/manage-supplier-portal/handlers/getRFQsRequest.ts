import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { RFQListItemResponse } from '../types'

const endpoint = '/rfqs'

export const getRFQsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<RFQListItemResponse[]>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<RFQListItemResponse[]>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

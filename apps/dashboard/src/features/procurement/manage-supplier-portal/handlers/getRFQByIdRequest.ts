import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { RFQDetailResponse } from '../types'

export const getRFQByIdRequest: QueryBlueprintFromTemplate<
  '/rfqs/:id',
  APIResponse<RFQDetailResponse>,
  QueryParams,
  QueryKey
> = {
  endpoint: '/rfqs/:id',
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<RFQDetailResponse>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

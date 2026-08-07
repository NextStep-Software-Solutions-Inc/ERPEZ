import type {
  QueryBlueprintFromTemplate,
  PaginationResponse,
  QueryParams,
  QueryKey,
} from 'erpez-shared-lib'
import type { FunctionConfig } from '../types/functionConfigTypes'
import api from '@/services/api'

const endpoint = '/function-configs'

export const getFunctionConfigsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<FunctionConfig>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<FunctionConfig>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}

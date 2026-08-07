import api from '@/services/api'
import {
  QueryBlueprintFromTemplate,
  APIResponse,
  QueryParams,
  QueryKey,
} from 'erpez-shared-lib'
import { FunctionConfig } from '../types/functionConfigTypes'

const endpoint = '/function-configs/:id'
export const getFunctionConfigByIdRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<FunctionConfig>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<FunctionConfig>>(finalUrl, {
      signal,
    })
    return response.data
  },
}

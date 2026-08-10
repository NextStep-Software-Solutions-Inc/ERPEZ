import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import type {
  CreateFunctionConfigPayload,
  FunctionConfig,
} from '../types/functionConfigTypes'
import api from '@/services/api'

const endpoint = '/function-configs'

export const createFunctionConfigRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<FunctionConfig>,
  undefined,
  CreateFunctionConfigPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<FunctionConfig>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}

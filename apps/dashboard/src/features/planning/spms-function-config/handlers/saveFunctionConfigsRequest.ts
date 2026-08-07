import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import type {
  UpdateFunctionConfigPayload,
  FunctionConfig,
} from '../types/functionConfigTypes'
import api from '@/services/api'

const endpoint = '/function-configs'

export const updateFunctionConfigRequest: MutationBlueprintFromTemplate<
  string,
  APIResponse<FunctionConfig>,
  undefined,
  UpdateFunctionConfigPayload
> = {
  endpoint: `${endpoint}/:id`,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<FunctionConfig>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}

export const deleteFunctionConfigRequest: MutationBlueprintFromTemplate<
  string,
  APIResponse<boolean>,
  undefined,
  undefined
> = {
  endpoint: `${endpoint}/:id`,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<APIResponse<boolean>>(finalUrl)
    return response.data
  },
}

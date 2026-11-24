import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import type { ParameterDefinition } from '../types/managementTypes'
import api from '@/services/api'

export interface CreateParameterPayload {
  displayName: string
  guidedQuestion: string
  description?: string
  sortOrder: number
  isActive: boolean
}

const endpoint = '/v2/market-scoping/parameters'

export const createParameterRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ParameterDefinition>,
  undefined,
  CreateParameterPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<ParameterDefinition>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}

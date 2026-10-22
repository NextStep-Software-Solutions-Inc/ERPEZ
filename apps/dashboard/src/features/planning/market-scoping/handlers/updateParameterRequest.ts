import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import type { ParameterDefinition } from '../types/managementTypes'
import api from '@/services/api'

export interface UpdateParameterPayload {
  id: string
  displayName: string
  guidedQuestion: string
  description?: string
  sortOrder: number
  isActive: boolean
}

const endpoint = '/v2/market-scoping/parameters/:id'

export const updateParameterRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ParameterDefinition>,
  undefined,
  UpdateParameterPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<ParameterDefinition>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}

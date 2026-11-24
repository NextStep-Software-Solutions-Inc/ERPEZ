import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/ppmps/:id/toggle-final' as const

export interface TogglePpmpFinalizationPayload {
  isFinal: boolean
}

export const togglePpmpFinalizationRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<unknown>,
  undefined,
  TogglePpmpFinalizationPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<unknown>>(finalUrl, payload)
    return response.data
  },
}

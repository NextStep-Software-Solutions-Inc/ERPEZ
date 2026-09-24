import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import type { UpdateObjectPayload } from '../types/objectCodeTypes'
import api from '@/services/api'

const endpoint = '/objects/:id'

export const updateObjectCodeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  unknown,
  undefined,
  UpdateObjectPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<unknown>>(finalUrl, payload)
    return response.data.data
  },
}

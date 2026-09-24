import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import type { CreateObjectPayload } from '../types/objectCodeTypes'
import api from '@/services/api'

const endpoint = '/objects'

export const createObjectCodeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  string,
  undefined,
  CreateObjectPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<string>>(finalUrl, payload)
    return response.data.data
  },
}

import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/uoms/:id'

export const deleteUOMRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Record<string, never>>,
  undefined,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response =
      await api.delete<APIResponse<Record<string, never>>>(finalUrl)
    return response.data
  },
}

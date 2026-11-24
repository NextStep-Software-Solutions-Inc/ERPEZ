import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/item-requests/:id'

export const deleteItemRequestApiRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Record<string, never>>,
  { id: string },
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response =
      await api.delete<APIResponse<Record<string, never>>>(finalUrl)
    return response.data
  },
}

import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/personnel/{id}'

export const deletePersonnelRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<void>,
  { id: string },
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<APIResponse<void>>(finalUrl)
    return response.data
  },
}

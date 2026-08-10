import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/org-units/{id}'

export const deleteOrgUnitRequest: MutationBlueprintFromTemplate<
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

import type {
  APIResponse,
  MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/plantilla-types/:id'

export const deletePlantillaTypeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean>
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const res = await api.delete<APIResponse<boolean>>(finalUrl)
    return res.data
  },
}

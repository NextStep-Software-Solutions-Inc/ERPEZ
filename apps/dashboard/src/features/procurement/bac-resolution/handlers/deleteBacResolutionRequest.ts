import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/bac/projects/:id'

export const deleteBacResolutionRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  void,
  undefined,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    await api.delete(finalUrl)
  },
}

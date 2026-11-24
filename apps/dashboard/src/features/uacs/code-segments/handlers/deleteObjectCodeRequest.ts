import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/objects/:id'

export const deleteObjectCodeRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  void
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    await api.delete(finalUrl)
  },
}

import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/direct-acquisitions/:id' as const

export const deleteDirectAcquisitionRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  void
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<{ succeeded: boolean; message?: string }>(finalUrl)
    if (!response.data?.succeeded) {
      throw new Error(response.data?.message || 'Failed to delete Direct Acquisition.')
    }
  },
}

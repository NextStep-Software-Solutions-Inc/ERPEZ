import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/direct-acquisitions/:id/return' as const

export interface ReturnDirectAcquisitionPayload {
  remarks: string
}

export const returnDirectAcquisitionRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  void,
  undefined,
  ReturnDirectAcquisitionPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) {
      throw new Error('Payload is required.')
    }
    const response = await api.post<{ succeeded: boolean; message?: string }>(finalUrl, payload)
    if (!response.data?.succeeded) {
      throw new Error(response.data?.message || 'Failed to return Direct Acquisition.')
    }
  },
}

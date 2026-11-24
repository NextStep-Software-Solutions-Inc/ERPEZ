import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/direct-acquisitions/:id/status' as const

export interface ChangeDirectAcquisitionStatusPayload {
  status: 'DRAFT' | 'PURCHASE_ENTRY' | 'FOR_DISBURSEMENT' | 'APPROVED' | 'RETURNED' | string
}

export const changeDirectAcquisitionStatusRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  void,
  undefined,
  ChangeDirectAcquisitionStatusPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) {
      throw new Error('Payload is required.')
    }
    const response = await api.patch<{ succeeded: boolean; message?: string }>(finalUrl, payload)
    if (!response.data?.succeeded) {
      throw new Error(response.data?.message || 'Failed to update Direct Acquisition status.')
    }
  },
}

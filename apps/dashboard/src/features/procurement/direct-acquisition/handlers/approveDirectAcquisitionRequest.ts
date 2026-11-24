import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/direct-acquisitions/:id/approve' as const

export interface ApproveDirectAcquisitionPayload {
  approvedFileId?: string
  approvedFileName?: string
  approvedFileType?: string
}

export const approveDirectAcquisitionRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  void,
  undefined,
  ApproveDirectAcquisitionPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<{ succeeded: boolean; message?: string }>(finalUrl, payload || {})
    if (!response.data?.succeeded) {
      throw new Error(response.data?.message || 'Failed to approve Direct Acquisition.')
    }
  },
}

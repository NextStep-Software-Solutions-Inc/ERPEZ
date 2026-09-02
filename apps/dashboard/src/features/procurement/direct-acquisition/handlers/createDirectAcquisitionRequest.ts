import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/direct-acquisitions'

export interface CreateDirectAcquisitionPayload {
  daNumber?: string
  consolidatedPRId: string
  bacProjectId?: string
  selectedItemIds?: string[]
  totalABC?: number
}

export const createDirectAcquisitionRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  string,
  undefined,
  CreateDirectAcquisitionPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) {
      throw new Error('Payload is required.')
    }
    const response = await api.post<{ succeeded: boolean; data: string; message?: string }>(finalUrl, payload)
    if (!response.data?.succeeded) {
      throw new Error(response.data?.message || 'Failed to create Direct Acquisition.')
    }
    return response.data.data
  },
}

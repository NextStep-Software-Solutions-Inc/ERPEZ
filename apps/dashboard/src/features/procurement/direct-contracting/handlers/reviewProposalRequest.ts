import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BackendDirectContractingItem } from '../types'
import api from '@/services/api'

const endpoint = '/direct-contracting/:id/review'

export interface ReviewProposalPayload {
  action: string
  remarks: string
}

export const reviewProposalRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  BackendDirectContractingItem,
  undefined,
  ReviewProposalPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) {
      throw new Error('Payload is required.')
    }
    const response = await api.post<{ succeeded: boolean; data: BackendDirectContractingItem }>(finalUrl, payload)
    if (!response.data?.succeeded || !response.data.data) {
      throw new Error('Failed to review proposal.')
    }
    return response.data.data
  },
}

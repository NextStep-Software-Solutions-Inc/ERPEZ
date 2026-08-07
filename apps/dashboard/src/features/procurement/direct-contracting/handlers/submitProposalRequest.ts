import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BackendDirectContractingItem } from '../store/directContractingStore'
import type { QuotationItemBid } from '@/features/procurement/supplier-portal/types/daItemTypes'
import api from '@/services/api'

const endpoint = '/direct-contracting/:id/proposal'

export interface SubmitProposalPayload {
  exclusivityProofUrl: string
  exclusivityProofFileName: string
  proposalNotes: string
  proposalAmount: number
  bidTotalAmount: number
  brand: string
  model: string
  brochureUrls: string[]
  bidAmounts: number[]
  quotationItems: QuotationItemBid[]
}

export const submitProposalRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  BackendDirectContractingItem,
  undefined,
  SubmitProposalPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) {
      throw new Error('Payload is required.')
    }
    const response = await api.post<{ succeeded: boolean; data: BackendDirectContractingItem }>(finalUrl, payload)
    if (!response.data?.succeeded || !response.data.data) {
      throw new Error('Failed to submit proposal.')
    }
    return response.data.data
  },
}

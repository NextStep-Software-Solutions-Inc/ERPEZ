import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BackendDirectContractingItem } from '../types'
import type { QuotationItemBid } from '@/features/procurement/supplier-portal/types/direct-contracting-item-type'
import api from '@/services/api'

const endpoint = '/direct-contracting/:id/proposal'

export interface ProposalItemPayload {
  cprItemId: string
  prItemId?: string
  unitBid: number
  bidUnitPrice?: number
  totalBid?: number
  bidTotalAmount?: number
  brand?: string
  bidBrand?: string
  model?: string
  bidModel?: string
  color?: string
  bidColor?: string
  brochureFileUrl?: string
  bidBrochureUrl?: string
  bidBrochureFileName?: string
}

export interface SubmitProposalPayload {
  supplierId?: string
  exclusivityDocumentUrl?: string
  exclusivityProofUrl: string
  exclusivityProofFileName?: string
  proposalRemarks?: string
  proposalNotes: string
  proposalAmount: number
  bidTotalAmount: number
  brand?: string
  model?: string
  color?: string
  brochureFileUrl?: string
  brochureFileName?: string
  brochureUrls?: string[]
  bidAmounts?: number[]
  proposalItems?: ProposalItemPayload[]
  quotationItems: Array<QuotationItemBid | ProposalItemPayload>
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
    const response = await api.post<{
      succeeded: boolean
      message?: string
      data: BackendDirectContractingItem
    }>(finalUrl, payload)
    if (!response.data?.succeeded) {
      throw new Error(response.data?.message || 'Failed to submit proposal.')
    }
    return response.data.data
  },
}

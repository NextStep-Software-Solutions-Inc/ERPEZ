import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/direct-acquisitions/:id/purchase-entry' as const

export interface RecordDirectPurchasePayload {
  supplierId?: string
  supplierName: string
  supplierTIN?: string
  finalAmount: number
  transactionDate: string
  paymentMethod: 'DIRECT_TO_VENDOR' | 'EMPLOYEE_REIMBURSEMENT'
  payeeUserId?: string
  payeeName?: string
  remarks?: string
  proofFiles: Array<{
    fileId: string
    fileName: string
    fileType?: string
    documentType?: string
  }>
}

export const recordDirectPurchaseRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  string,
  undefined,
  RecordDirectPurchasePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) {
      throw new Error('Payload is required.')
    }
    const response = await api.post<{ succeeded: boolean; data: string; message?: string }>(finalUrl, payload)
    if (!response.data?.succeeded) {
      throw new Error(response.data?.message || 'Failed to record purchase entry.')
    }
    return response.data.data
  },
}

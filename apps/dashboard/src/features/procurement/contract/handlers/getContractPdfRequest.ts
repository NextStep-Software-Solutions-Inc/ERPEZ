/**
 * GET /contracts/:id/pdf
 * Stream server-rendered Contract Agreement PDF directly
 */

import api from '@/services/api'

export interface ContractPdfResult {
  fileName: string
  blob: Blob
}

export const getContractPdfRequest = {
  endpoint: '/contracts/:id/pdf',
  fetcher: async ({ contractId, contractNumber }: { contractId: string; contractNumber?: string }): Promise<ContractPdfResult> => {
    const fileName = `${contractNumber || 'Contract'}_Contract_Agreement.pdf`
    const response = await api.get<Blob>(`/contracts/${contractId}/pdf`, {
      responseType: 'blob',
    })

    if (!response.data || response.data.size === 0) {
      throw new Error('Received empty contract PDF document.')
    }

    return {
      fileName,
      blob: response.data,
    }
  },
}
/**
 * generatePurchaseOrderDocumentRequest.ts
 * Handlers for generating, streaming, and downloading the official
 * Purchase Order PDF document (COA GAM Appendix 61).
 */

import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const generateEndpoint = '/purchase-orders/:id/generate-document' as const

export const generatePurchaseOrderDocumentRequest: MutationBlueprintFromTemplate<
  typeof generateEndpoint,
  APIResponse<string>,
  { id: string },
  undefined
> = {
  endpoint: generateEndpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<string>>(finalUrl)
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Failed to generate Purchase Order document.')
    }
    return response.data
  },
}

/**
 * Fetch the official server-rendered Purchase Order PDF as a Blob
 */
export async function fetchPurchaseOrderPdfBlob(purchaseOrderId: string): Promise<Blob> {
  const response = await api.get<Blob>(`/purchase-orders/${purchaseOrderId}/pdf`, {
    responseType: 'blob',
  })
  return response.data
}

/**
 * Download the official server-rendered Purchase Order PDF directly
 */
export async function downloadPurchaseOrderPdf(
  purchaseOrderId: string,
  fileName?: string
): Promise<void> {
  const blob = await fetchPurchaseOrderPdfBlob(purchaseOrderId)
  const resolvedFileName = fileName || `Purchase_Order_${purchaseOrderId}.pdf`
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = resolvedFileName
  anchor.rel = 'noreferrer'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(objectUrl)
}

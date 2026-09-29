import api from '@/services/api'

export type RFQDocumentFormat = 'Pdf' | 'Excel'

export interface GenerateRFQDocumentPayload {
  rfqId: string
  format?: RFQDocumentFormat
  supplierId?: string
  blankTemplate?: boolean
  filename?: string
}

export async function generateAndDownloadRfqDocument(payload: GenerateRFQDocumentPayload): Promise<void> {
  const { rfqId, format = 'Pdf', supplierId, blankTemplate = false, filename } = payload

  // Step 1: Trigger generation — returns a documentId (Guid)
  let generateResponse: any
  try {
    generateResponse = await api.post<{ data: string }>(
      `/rfqs/${rfqId}/generate`,
      null,
      {
        params: {
          format,
          supplierId: supplierId || undefined,
          blankTemplate,
        },
      }
    )
  } catch (err: any) {
    if (err?.response?.status === 403) {
      // Fallback to supplier portal endpoint for external supplier accounts
      generateResponse = await api.post<{ data: string }>(
        `/api/supplier/rfqs/${rfqId}/generate`,
        null,
        {
          params: {
            format,
            supplierId: supplierId || undefined,
            blankTemplate,
          },
        }
      )
    } else {
      throw err
    }
  }

  const documentId: string = (generateResponse.data as any)?.data ?? generateResponse.data

  if (!documentId) {
    throw new Error('Document generation failed: no document ID returned')
  }

  // Step 2: Download the generated file as a blob
  const downloadResponse = await api.get(
    `/api/planning/documents/${documentId}/download`,
    { responseType: 'blob' }
  )

  const contentType =
    format === 'Excel'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/pdf'

  const extension = format === 'Excel' ? 'xlsx' : 'pdf'
  const finalFilename = filename || `RFQ_${Date.now()}.${extension}`

  const blob = new Blob([downloadResponse.data], { type: contentType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = finalFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generates an RFQ PDF (blank canvass or supplier-filled quotation)
 * and returns an object blob URL ready for inline iframe preview.
 */
export async function getSupplierRfqPdfBlobUrl(
  rfqId: string,
  supplierId?: string,
  blankTemplate: boolean = false
): Promise<string> {
  let generateResponse: any
  try {
    generateResponse = await api.post<{ data: string }>(
      `/rfqs/${rfqId}/generate`,
      null,
      {
        params: {
          format: 'Pdf',
          supplierId: supplierId || undefined,
          blankTemplate,
        },
      }
    )
  } catch (err: any) {
    if (err?.response?.status === 403) {
      // Fallback to supplier portal endpoint for external supplier accounts
      generateResponse = await api.post<{ data: string }>(
        `/api/supplier/rfqs/${rfqId}/generate`,
        null,
        {
          params: {
            format: 'Pdf',
            supplierId: supplierId || undefined,
            blankTemplate,
          },
        }
      )
    } else {
      throw err
    }
  }

  const documentId: string = (generateResponse.data as any)?.data ?? generateResponse.data

  if (!documentId) {
    throw new Error('Document generation failed: no document ID returned')
  }

  const downloadResponse = await api.get(
    `/api/planning/documents/${documentId}/download`,
    { responseType: 'blob' }
  )

  const blob = new Blob([downloadResponse.data], { type: 'application/pdf' })
  return URL.createObjectURL(blob)
}

/**
 * Downloads a blank RFQ template via the Supplier Portal endpoint.
 */
export async function downloadSupplierPortalBlankTemplate(rfqId: string, filename?: string): Promise<void> {
  const res = await api.post<{ data: string }>(`/api/supplier/rfqs/${rfqId}/generate-template`)
  const documentId: string = (res.data as any)?.data ?? res.data

  if (!documentId) {
    throw new Error('Template generation failed: no document ID returned')
  }

  const downloadResponse = await api.get(
    `/api/planning/documents/${documentId}/download`,
    { responseType: 'blob' }
  )

  const blob = new Blob([downloadResponse.data], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename || `RFQ_Blank_Template_${Date.now()}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}


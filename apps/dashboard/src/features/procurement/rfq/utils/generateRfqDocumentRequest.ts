import api from '@/services/api'

export type RFQDocumentFormat = 'Pdf' | 'Excel'

export interface GenerateRFQDocumentPayload {
  rfqId: string
  format?: RFQDocumentFormat
  filename?: string
}

export async function generateAndDownloadRfqDocument(payload: GenerateRFQDocumentPayload): Promise<void> {
  const { rfqId, format = 'Pdf', filename } = payload

  // Step 1: Trigger generation — returns a documentId (Guid)
  const generateResponse = await api.post<{ data: string }>(
    `/rfqs/${rfqId}/generate`,
    null,
    { params: { format } }
  )
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

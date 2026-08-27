/**
 * generateAprDocumentRequest
 * Triggers backend document generation and downloads or previews the resulting APR Form No. 002 file.
 *
 * Flow (two-step as defined in DocumentController):
 *   Step 1: POST /api/planning/documents/apr/{aprId}/generate?format=Pdf|Excel
 *           → returns { data: documentId (Guid string) }
 *   Step 2: GET  /api/planning/documents/{documentId}/download
 *           → returns binary blob (PDF or XLSX)
 */

import api from '@/services/api'

export type APRDocumentFormat = 'Pdf' | 'Excel'

export interface GenerateAPRDocumentPayload {
  aprId: string
  format?: APRDocumentFormat
  filename?: string
}

export async function fetchAprPdfBlobUrl(aprId: string): Promise<{ documentId: string; blobUrl: string }> {
  // Step 1: Trigger PDF generation — returns a documentId (Guid)
  const generateResponse = await api.post<{ data: string }>(
    `/api/planning/documents/apr/${aprId}/generate`,
    null,
    { params: { format: 'Pdf' } }
  )
  const documentId: string = (generateResponse.data as any)?.data ?? generateResponse.data

  if (!documentId) {
    throw new Error('Document generation failed: no document ID returned')
  }

  // Step 2: Retrieve the generated binary PDF blob
  const downloadResponse = await api.get(
    `/api/planning/documents/${documentId}/download`,
    { responseType: 'blob' }
  )

  const blob = new Blob([downloadResponse.data], { type: 'application/pdf' })
  const blobUrl = URL.createObjectURL(blob)
  return { documentId, blobUrl }
}

export async function generateAndDownloadAprDocument(payload: GenerateAPRDocumentPayload): Promise<void> {
  const { aprId, format = 'Pdf', filename } = payload

  // Step 1: Trigger generation — returns a documentId (Guid)
  const generateResponse = await api.post<{ data: string }>(
    `/api/planning/documents/apr/${aprId}/generate`,
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
  const finalFilename = filename || `APR_Form002_${Date.now()}.${extension}`

  const blob = new Blob([downloadResponse.data], { type: contentType })
  const url = URL.createObjectURL(blob)

  // Trigger browser download
  const link = document.createElement('a')
  link.href = url
  link.download = finalFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

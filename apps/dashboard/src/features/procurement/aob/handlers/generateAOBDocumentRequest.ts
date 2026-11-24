/**
 * generateAOBDocumentRequest
 * Triggers backend document generation and downloads the official Abstract of Quotation (PDF/Excel)
 *
 * Flow:
 *   Step 1: POST /api/planning/documents/aob/{aobId}/generate?format=Pdf
 *           -> returns { data: documentId (Guid string) }
 *   Step 2: GET  /api/planning/documents/{documentId}/download
 *           -> returns binary blob (PDF)
 */

import api from '@/services/api'

export type AOBDocumentFormat = 'Pdf' | 'Excel'

export interface GenerateAOBDocumentPayload {
  aobId: string
  format?: AOBDocumentFormat
  filename?: string
}

export async function fetchAobPdfBlobUrl(aobId: string): Promise<{ documentId: string; blobUrl: string }> {
  // Step 1: Trigger PDF generation - returns documentId (Guid)
  const generateResponse = await api.post<{ data: string }>(
    `/api/planning/documents/aob/${aobId}/generate`,
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

export async function generateAndDownloadAobDocument(payload: GenerateAOBDocumentPayload): Promise<void> {
  const { aobId, format = 'Pdf', filename } = payload

  // Step 1: Trigger generation - returns a documentId (Guid)
  const generateResponse = await api.post<{ data: string }>(
    `/api/planning/documents/aob/${aobId}/generate`,
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
  const defaultFilename = `Abstract_of_Quotation_${new Date().toISOString().slice(0, 10)}.${extension}`
  const finalFilename = filename || defaultFilename

  const blob = new Blob([downloadResponse.data], { type: contentType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', finalFilename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

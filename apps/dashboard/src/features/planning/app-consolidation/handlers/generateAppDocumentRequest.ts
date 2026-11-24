/**
 * generateAppDocumentRequest
 * Triggers backend document generation and downloads or previews the resulting file.
 *
 * Flow (two-step as defined in GeneratedDocumentsController):
 *   Step 1: POST /api/planning/documents/app/{appId}/generate?format=Pdf|Excel
 *           → returns { data: documentId (Guid string) }
 *   Step 2: GET  /api/planning/documents/{documentId}/download
 *           → returns binary blob (PDF or XLSX)
 */

import api from '@/services/api'

export type AppDocumentFormat = 'Pdf' | 'Excel'

export interface GenerateAppDocumentPayload {
  appId: string
  format: AppDocumentFormat
  filename: string
}

export async function fetchAppPdfBlobUrl(appId: string): Promise<{ documentId: string; blobUrl: string }> {
  // Step 1: Trigger PDF generation — returns a documentId (Guid)
  const generateResponse = await api.post<{ data: string }>(
    `/api/planning/documents/app/${appId}/generate`,
    null,
    { params: { format: 'Pdf' } }
  )
  const documentId: string = generateResponse.data?.data ?? (generateResponse.data as any)

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

export async function generateAppDocument(payload: GenerateAppDocumentPayload): Promise<void> {
  const { appId, format, filename } = payload

  // Step 1: Trigger generation — returns a documentId (Guid)
  const generateResponse = await api.post<{ data: string }>(
    `/api/planning/documents/app/${appId}/generate`,
    null,
    { params: { format } }
  )
  const documentId: string = generateResponse.data?.data ?? (generateResponse.data as any)

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

  const blob = new Blob([downloadResponse.data], { type: contentType })
  const url = URL.createObjectURL(blob)

  // Trigger browser download
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

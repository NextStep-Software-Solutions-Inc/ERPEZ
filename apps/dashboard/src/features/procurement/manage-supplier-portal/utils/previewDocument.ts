import api from '@/services/api'

/**
 * Previews or downloads an uploaded supplier document securely using authenticated API client.
 * 
 * - For PDFs and images: opens an in-memory blob URL in a new tab for native inline preview.
 * - For Word, Excel, ZIP, etc.: triggers browser download with the document name.
 */
export async function previewDocument(
  url?: string,
  documentName?: string,
  declaredType?: string,
): Promise<void> {
  if (!url || url.trim() === '') {
    throw new Error('Document URL is missing.')
  }

  const trimmed = url.trim()

  // 1. Direct blob or data URLs
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    window.open(trimmed, '_blank')
    return
  }

  // 2. Extract UUID if present (raw UUID or /files/download/{uuid} or /files/{uuid}/download)
  const uuidRegex =
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
  const match = trimmed.match(uuidRegex)
  const endpoint = match ? `/files/download/${match[0]}` : trimmed

  const response = await api.get<Blob>(endpoint, {
    responseType: 'blob',
  })

  if (!response.data || response.data.size === 0) {
    throw new Error('Empty file received.')
  }

  const headerContentType = response.headers['content-type'] as string | undefined
  const contentType =
    headerContentType && headerContentType !== 'application/octet-stream'
      ? headerContentType
      : declaredType?.toLowerCase() === 'pdf' || documentName?.toLowerCase().endsWith('.pdf')
      ? 'application/pdf'
      : declaredType?.toLowerCase() === 'docx' || documentName?.toLowerCase().endsWith('.docx')
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : declaredType?.toLowerCase() === 'xlsx' || documentName?.toLowerCase().endsWith('.xlsx')
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : headerContentType || 'application/octet-stream'

  const blob = new Blob([response.data], { type: contentType })
  const blobUrl = URL.createObjectURL(blob)

  const isPdf =
    contentType === 'application/pdf' ||
    declaredType?.toLowerCase() === 'pdf' ||
    documentName?.toLowerCase().endsWith('.pdf')
  const isImage = contentType.startsWith('image/')

  if (isPdf || isImage) {
    window.open(blobUrl, '_blank')
    return
  }

  // Determine proper filename with extension for non-inline documents
  let fileName = documentName || 'document'
  const disposition = response.headers['content-disposition'] as string | undefined
  if (disposition && disposition.includes('filename=')) {
    const matchName = disposition.match(/filename="?([^"]+)"?/)
    if (matchName?.[1]) {
      fileName = matchName[1]
    }
  } else if (declaredType && !fileName.toLowerCase().endsWith(`.${declaredType.toLowerCase()}`)) {
    fileName = `${fileName}.${declaredType.toLowerCase()}`
  }

  const link = document.createElement('a')
  link.href = blobUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
}

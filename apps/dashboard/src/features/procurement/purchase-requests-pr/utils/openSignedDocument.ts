import { api } from '@/services/api'
import { toast } from 'sonner'

/**
 * Robust helper to view/download signed PDF documents.
 * Handles UUID file IDs, /files/download/ endpoints with Keycloak authentication,
 * object/blob URLs, and absolute URLs.
 */
export async function openSignedDocument(
  signedPdfUrl?: string,
  documentTitle = 'Signed Document',
): Promise<void> {
  if (!signedPdfUrl || signedPdfUrl.trim() === '') {
    toast.error('No signed document attached.')
    return
  }

  const trimmed = signedPdfUrl.trim()

  // 1. Direct blob or data URLs (e.g. from local file object URL)
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    window.open(trimmed, '_blank')
    return
  }

  // 2. Extract UUID if present (raw UUID or /files/download/{uuid})
  const uuidRegex =
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
  const match = trimmed.match(uuidRegex)
  const fileId = match ? match[0] : null

  if (fileId) {
    const toastId = toast.loading(`Opening ${documentTitle}...`)
    try {
      const response = await api.get<Blob>(`/files/download/${fileId}`, {
        responseType: 'blob',
      })
      const contentType = (response.headers['content-type'] as string) || 'application/pdf'
      const blob = new Blob([response.data], { type: contentType })
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, '_blank')
      toast.dismiss(toastId)
    } catch (error) {
      toast.dismiss(toastId)
      toast.error('Failed to load signed document. The file may no longer be available.')
    }
    return
  }

  // 3. Absolute HTTP/HTTPS URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    window.open(trimmed, '_blank')
    return
  }

  // 4. Relative backend path fallback
  const backendUrl = import.meta.env.VITE_ERPEZ_BACKEND_URL || ''
  const fullUrl = `${backendUrl}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`
  window.open(fullUrl, '_blank')
}

import JSZip from 'jszip'
import api from '@/services/api'

/**
 * Bulk Download Utility
 * 
 * Handles packaging and downloading multiple documents into a single ZIP archive
 * securely using authenticated API client.
 */

interface DocumentToDownload {
  name: string
  url: string
  type?: string
}

function getUniqueFileName(name: string, existingNames: Set<string>): string {
  let sanitized = name.replace(/[<>:"/\\|?*]/g, '_').trim()
  if (!sanitized) {
    sanitized = 'document'
  }

  if (!existingNames.has(sanitized.toLowerCase())) {
    existingNames.add(sanitized.toLowerCase())
    return sanitized
  }

  const dotIndex = sanitized.lastIndexOf('.')
  const baseName = dotIndex !== -1 ? sanitized.substring(0, dotIndex) : sanitized
  const extension = dotIndex !== -1 ? sanitized.substring(dotIndex) : ''

  let counter = 1
  let candidate = `${baseName} (${counter})${extension}`
  while (existingNames.has(candidate.toLowerCase())) {
    counter++
    candidate = `${baseName} (${counter})${extension}`
  }

  existingNames.add(candidate.toLowerCase())
  return candidate
}

/**
 * Download multiple documents packaged in a single ZIP file
 * @param documents Array of documents to download
 * @param archiveName Name of the generated zip file (without or with .zip extension)
 * @param onProgress Optional callback for progress updates
 */
export async function bulkDownloadDocuments(
  documents: DocumentToDownload[],
  archiveName: string,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  if (documents.length === 0) {
    throw new Error('No documents to download')
  }

  const zip = new JSZip()
  const existingNames = new Set<string>()
  let addedCount = 0

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i]
    try {
      // Resolve endpoint (extract UUID or use path)
      const uuidRegex =
        /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
      const match = doc.url.match(uuidRegex)
      const endpoint = match ? `/files/download/${match[0]}` : doc.url

      const response = await api.get<Blob>(endpoint, {
        responseType: 'blob',
      })

      if (!response.data || response.data.size === 0) {
        continue
      }

      const contentType =
        (response.headers['content-type'] as string) || 'application/octet-stream'
      const blob = new Blob([response.data], { type: contentType })

      // Determine proper filename with extension
      let fileName = doc.name
      const disposition = response.headers['content-disposition'] as string | undefined
      if (disposition && disposition.includes('filename=')) {
        const matchName = disposition.match(/filename="?([^"]+)"?/)
        if (matchName?.[1]) {
          fileName = matchName[1]
        }
      } else if (doc.type && !fileName.toLowerCase().endsWith(`.${doc.type.toLowerCase()}`)) {
        fileName = `${fileName}.${doc.type.toLowerCase()}`
      }

      const uniqueName = getUniqueFileName(fileName, existingNames)
      zip.file(uniqueName, blob)
      addedCount++
    } catch (error) {
      console.warn(`Error downloading ${doc.name}:`, error)
    } finally {
      if (onProgress) {
        onProgress(i + 1, documents.length)
      }
    }
  }

  if (addedCount === 0) {
    throw new Error('Failed to download any documents')
  }

  // Generate zip file and trigger single browser download
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const sanitizedArchiveName = (archiveName || 'Supplier_Documents')
    .replace(/[<>:"/\\|?*]/g, '_')
    .trim()
  const zipFileName = sanitizedArchiveName.toLowerCase().endsWith('.zip')
    ? sanitizedArchiveName
    : `${sanitizedArchiveName}.zip`

  const link = document.createElement('a')
  const blobUrl = URL.createObjectURL(zipBlob)
  link.href = blobUrl
  link.download = zipFileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
}


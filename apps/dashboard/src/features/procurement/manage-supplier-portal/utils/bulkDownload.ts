import api from '@/services/api'

/**
 * Bulk Download Utility
 * 
 * Handles downloading multiple documents securely using authenticated API client
 */

interface DocumentToDownload {
  name: string
  url: string
  type?: string
}

/**
 * Download multiple documents sequentially
 * @param documents Array of documents to download
 * @param projectName Optional project name
 * @param onProgress Optional callback for progress updates
 */
export async function bulkDownloadDocuments(
  documents: DocumentToDownload[],
  projectName: string,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  if (documents.length === 0) {
    throw new Error('No documents to download')
  }

  let downloadedCount = 0

  for (const doc of documents) {
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

      // Create download link
      const link = document.createElement('a')
      const blobUrl = URL.createObjectURL(blob)
      link.href = blobUrl
      link.download = fileName
      document.body.appendChild(link)

      // Trigger download with small delay to avoid blocking
      setTimeout(() => {
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
      }, downloadedCount * 200)

      downloadedCount++

      if (onProgress) {
        onProgress(downloadedCount, documents.length)
      }
    } catch (error) {
      console.warn(`Error downloading ${doc.name}:`, error)
    }
  }

  if (downloadedCount === 0) {
    throw new Error('Failed to download any documents')
  }
}


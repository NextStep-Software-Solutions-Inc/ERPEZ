/**
 * Bulk Download Utility
 * 
 * Handles downloading multiple documents
 * For now, downloads each document sequentially
 * TODO: Integrate JSZip when available for ZIP packaging
 */

interface DocumentToDownload {
  name: string
  url: string
}

/**
 * Download multiple documents sequentially
 * Currently downloads each file individually
 * @param documents Array of documents to download
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

  try {
    let downloadedCount = 0

    for (const doc of documents) {
      try {
        // Fetch document
        const response = await fetch(doc.url)
        if (!response.ok) {
          console.warn(`Failed to download ${doc.name}: ${response.statusText}`)
          continue
        }

        const blob = await response.blob()
        
        // Create download link
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = doc.name
        
        // Trigger download with small delay to avoid blocking
        setTimeout(() => {
          link.click()
          URL.revokeObjectURL(link.href)
        }, downloadedCount * 200) // Stagger downloads

        downloadedCount++

        if (onProgress) {
          onProgress(downloadedCount, documents.length)
        }
      } catch (error) {
        console.warn(`Error downloading ${doc.name}:`, error)
        // Continue with other files
      }
    }

    if (downloadedCount === 0) {
      throw new Error('Failed to download any documents')
    }
  } catch (error) {
    console.error('Bulk download failed:', error)
    throw error
  }
}


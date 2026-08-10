export function downloadBiddingDocumentBlob(fileName: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const objectUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')

  try {
    link.href = objectUrl
    link.download = fileName
    link.rel = 'noreferrer'
    document.body.appendChild(link)
    link.click()
  } finally {
    link.remove()
    window.URL.revokeObjectURL(objectUrl)
  }
}

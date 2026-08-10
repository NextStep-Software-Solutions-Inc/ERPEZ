export function downloadBacResolutionBlob(blob: Blob, fileName: string) {
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
    // Revoke synchronously to guarantee the URL is released.
    try {
      window.URL.revokeObjectURL(objectUrl)
    } catch (err) {
      // swallow - revocation failure shouldn't break the app
    }
  }
}

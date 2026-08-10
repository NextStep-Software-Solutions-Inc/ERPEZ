import type { PrintPurchaseOrderResult } from '../types'

export function downloadPurchaseOrderBlob({
  fileName,
  blob,
}: PrintPurchaseOrderResult) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = objectUrl
  anchor.download = fileName
  anchor.rel = 'noreferrer'
  anchor.click()
  URL.revokeObjectURL(objectUrl)
}

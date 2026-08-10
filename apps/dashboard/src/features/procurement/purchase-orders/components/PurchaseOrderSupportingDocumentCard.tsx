import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type PurchaseOrderSupportingDocumentCardProps = {
  supportingDocument: File | null
}

export function PurchaseOrderSupportingDocumentCard({
  supportingDocument,
}: PurchaseOrderSupportingDocumentCardProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!supportingDocument) {
      setPreviewUrl(null)
      return undefined
    }

    const objectUrl = URL.createObjectURL(supportingDocument)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [supportingDocument])

  if (!supportingDocument) {
    return (
      <Card className="border-default-200/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">BID Supporting Document</CardTitle>
          <CardDescription>
            No BID document has been attached to this purchase order yet.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const handleDownload = () => {
    if (!previewUrl) {
      return
    }

    const anchor = document.createElement('a')
    anchor.href = previewUrl
    anchor.download = supportingDocument.name
    anchor.rel = 'noreferrer'
    anchor.click()
  }

  return (
    <Card className="border-default-200/70 shadow-sm">
      <CardHeader className="space-y-2 border-b border-default-200 pb-4">
        <CardTitle className="text-base">BID Supporting Document</CardTitle>
        <CardDescription>
          Preview and download the attached BID PDF.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <div className="rounded-xl border border-default-200 bg-default-50 p-3 text-sm text-default-700">
          <div className="font-medium text-default-900">File</div>
          <div className="mt-1 wrap-break-word">{supportingDocument.name}</div>
        </div>

        <div className="overflow-hidden rounded-xl border border-default-200 bg-background">
          {previewUrl ? (
            <iframe
              title="BID supporting document preview"
              src={previewUrl}
              className="h-80 w-full"
            />
          ) : (
            <div className="flex h-80 items-center justify-center text-sm text-default-500">
              Preparing preview...
            </div>
          )}
        </div>

        <Button variant="outline" color="secondary" onClick={handleDownload}>
          Download BID
        </Button>
      </CardContent>
    </Card>
  )
}

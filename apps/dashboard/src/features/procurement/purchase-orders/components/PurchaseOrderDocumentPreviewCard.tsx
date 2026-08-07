import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type PurchaseOrderDocumentPreviewCardProps = {
  file: File | null
  title: string
  description: string
  emptyDescription: string
  previewTitle: string
  downloadLabel: string
}

export function PurchaseOrderDocumentPreviewCard({
  file,
  title,
  description,
  emptyDescription,
  previewTitle,
  downloadLabel,
}: PurchaseOrderDocumentPreviewCardProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return undefined
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  if (!file) {
    return (
      <Card className="border-default-200/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{emptyDescription}</CardDescription>
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
    anchor.download = file.name
    anchor.rel = 'noreferrer'
    anchor.click()
  }

  return (
    <Card className="border-default-200/70 shadow-sm">
      <CardHeader className="space-y-2 border-b border-default-200 pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <div className="rounded-xl border border-default-200 bg-default-50 p-3 text-sm text-default-700">
          <div className="font-medium text-default-900">File</div>
          <div className="mt-1 wrap-break-word">{file.name}</div>
        </div>

        <div className="overflow-hidden rounded-xl border border-default-200 bg-background">
          {previewUrl ? (
            <iframe
              title={previewTitle}
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
          {downloadLabel}
        </Button>
      </CardContent>
    </Card>
  )
}

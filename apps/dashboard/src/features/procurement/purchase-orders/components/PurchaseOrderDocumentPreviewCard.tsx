import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getFileRequest } from '@/lib/getFileRequest'

type PurchaseOrderDocumentPreviewCardProps = {
  file: File | string | null
  fileName?: string | null
  title: string
  description: string
  emptyDescription: string
  previewTitle: string
  downloadLabel: string
}

export function PurchaseOrderDocumentPreviewCard({
  file,
  fileName,
  title,
  description,
  emptyDescription,
  previewTitle,
  downloadLabel,
}: PurchaseOrderDocumentPreviewCardProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayName =
    fileName ||
    (file instanceof File ? file.name : null) ||
    (typeof file === 'string'
      ? file.split('/').pop()?.split('?')[0] || 'document.pdf'
      : 'document.pdf')

  useEffect(() => {
    let isMounted = true
    let activeObjectUrl: string | null = null

    if (!file) {
      setPreviewUrl(null)
      setIsLoading(false)
      setError(null)
      return undefined
    }

    if (file instanceof Blob) {
      const objectUrl = URL.createObjectURL(file)
      activeObjectUrl = objectUrl
      setPreviewUrl(objectUrl)
      setIsLoading(false)
      setError(null)
      return () => {
        URL.revokeObjectURL(objectUrl)
      }
    }

    if (typeof file === 'string') {
      const trimmed = file.trim()
      if (!trimmed) {
        setPreviewUrl(null)
        setIsLoading(false)
        setError(null)
        return undefined
      }

      if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
        setPreviewUrl(trimmed)
        setIsLoading(false)
        setError(null)
        return undefined
      }

      const uuidRegex =
        /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
      const match = trimmed.match(uuidRegex)
      const fileId = match ? match[0] : trimmed.replace(/^\/files\/download\//, '')

      setIsLoading(true)
      setError(null)

      getFileRequest.fetcher({ finalUrl: `/files/download/${fileId}` })
        .then((res) => {
          if (!isMounted) return
          const contentType =
            res.blob.type && res.blob.type !== 'application/octet-stream'
              ? res.blob.type
              : 'application/pdf'
          const pdfBlob = new Blob([res.blob], { type: contentType })
          const objectUrl = URL.createObjectURL(pdfBlob)
          activeObjectUrl = objectUrl
          setPreviewUrl(objectUrl)
          setIsLoading(false)
        })
        .catch((err) => {
          if (!isMounted) return
          console.error('Failed to load document preview:', err)
          setError('Failed to load document preview.')
          setIsLoading(false)
        })

      return () => {
        isMounted = false
        if (activeObjectUrl) {
          URL.revokeObjectURL(activeObjectUrl)
        }
      }
    }

    return undefined
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
    anchor.download = displayName
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
          <div className="mt-1 wrap-break-word">{displayName}</div>
        </div>

        <div className="overflow-hidden rounded-xl border border-default-200 bg-background">
          {isLoading ? (
            <div className="flex h-80 items-center justify-center text-sm text-default-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Loading document preview...
              </span>
            </div>
          ) : error ? (
            <div className="flex h-80 flex-col items-center justify-center gap-2 text-sm text-destructive">
              <p>{error}</p>
            </div>
          ) : previewUrl ? (
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

        <Button
          variant="outline"
          color="secondary"
          onClick={handleDownload}
          disabled={!previewUrl || isLoading}
        >
          {downloadLabel}
        </Button>
      </CardContent>
    </Card>
  )
}


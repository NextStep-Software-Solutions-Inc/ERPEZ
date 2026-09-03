import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Loader2,
} from 'lucide-react'
import type { MasterDoc } from '../types'
import api from '@/services/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface TemplateViewerDialogProps {
  doc: MasterDoc | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatBytes(bytes?: number): string {
  if (!bytes) return ''
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

function getFileIcon(contentType: string, fileName: string) {
  if (
    contentType.includes('spreadsheet') ||
    contentType.includes('excel') ||
    /\.(xlsx?|csv)$/i.test(fileName)
  ) {
    return <FileSpreadsheet className="h-12 w-12 text-emerald-600" />
  }
  if (
    contentType.includes('word') ||
    contentType.includes('document') ||
    /\.(docx?|rtf)$/i.test(fileName)
  ) {
    return <FileText className="h-12 w-12 text-blue-600" />
  }
  if (contentType.includes('pdf') || /\.pdf$/i.test(fileName)) {
    return <FileText className="h-12 w-12 text-red-600" />
  }
  return <FileCheck className="h-12 w-12 text-primary" />
}

export function TemplateViewerDialog({
  doc,
  open,
  onOpenChange,
}: TemplateViewerDialogProps) {
  const [resolvedBlobUrl, setResolvedBlobUrl] = useState<string | null>(null)
  const [detectedType, setDetectedType] = useState<string>('')
  const [resolvedFileName, setResolvedFileName] = useState<string>('')
  const [fileSizeBytes, setFileSizeBytes] = useState<number | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)

  const templateIdentifier = doc?.templatePreviewUrl || doc?.templateFile || ''
  const hasTemplateAttached = Boolean(
    templateIdentifier && templateIdentifier.trim() !== '',
  )

  useEffect(() => {
    if (!open || !doc || !hasTemplateAttached) {
      setResolvedBlobUrl(null)
      setDetectedType('')
      setResolvedFileName('')
      setFileSizeBytes(undefined)
      setIsLoading(false)
      setHasError(false)
      return
    }

    let isMounted = true
    const rawUrl = doc.templatePreviewUrl || doc.templateFile || ''

    // If already a local blob/data URL, use directly
    if (rawUrl.startsWith('blob:') || rawUrl.startsWith('data:')) {
      setResolvedBlobUrl(rawUrl)
      setDetectedType(doc.templateFileType || '')
      setResolvedFileName(doc.templateFile || `${doc.name}.pdf`)
      setIsLoading(false)
      setHasError(false)
      return
    }

    // Extract file ID from URL or raw GUID
    const uuidRegex =
      /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
    const match = rawUrl.match(uuidRegex)
    const fileId = match ? match[0] : null

    if (!fileId && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
      setResolvedBlobUrl(rawUrl)
      setDetectedType(doc.templateFileType || '')
      setResolvedFileName(doc.templateFile || doc.name)
      setIsLoading(false)
      setHasError(false)
      return
    }

    if (!fileId) {
      setResolvedBlobUrl(null)
      setIsLoading(false)
      setHasError(true)
      return
    }

    setIsLoading(true)
    setHasError(false)

    api
      .get<Blob>(`/files/download/${fileId}`, { responseType: 'blob' })
      .then((response) => {
        if (!isMounted) return

        const contentType =
          (response.headers['content-type'] as string) ||
          doc.templateFileType ||
          'application/octet-stream'

        let fileName = doc.templateFile || ''
        const disposition = response.headers['content-disposition'] as string | undefined
        if (disposition && disposition.includes('filename=')) {
          const matchName = disposition.match(/filename="?([^"]+)"?/)
          if (matchName?.[1]) {
            fileName = matchName[1]
          }
        }
        if (!fileName) {
          fileName = `${doc.name}`
        }

        const blob = new Blob([response.data], { type: contentType })
        const objectUrl = URL.createObjectURL(blob)

        setResolvedBlobUrl(objectUrl)
        setDetectedType(contentType)
        setResolvedFileName(fileName)
        setFileSizeBytes(blob.size)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load template file:', err)
        if (isMounted) {
          setHasError(true)
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [open, doc, hasTemplateAttached])

  // Revoke object URL on unmount/change
  useEffect(() => {
    return () => {
      if (resolvedBlobUrl && resolvedBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(resolvedBlobUrl)
      }
    }
  }, [resolvedBlobUrl])

  const previewTitle = doc?.name ?? 'Standard Template'
  const envelopeLabel =
    doc?.envelope === 2 ? 'Envelope 2: Financial' : 'Envelope 1: Technical'

  const isPdf = Boolean(
    detectedType.includes('pdf') ||
      resolvedFileName.toLowerCase().endsWith('.pdf') ||
      (doc?.templateFile && doc.templateFile.toLowerCase().endsWith('.pdf')),
  )
  const isImage = Boolean(
    detectedType.startsWith('image/') ||
      /\.(jpg|jpeg|png|gif|webp)$/i.test(resolvedFileName),
  )

  const handleDownload = () => {
    if (!resolvedBlobUrl) return
    const link = document.createElement('a')
    link.href = resolvedBlobUrl
    link.download = resolvedFileName || `${previewTitle}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenNewTab = () => {
    if (!resolvedBlobUrl) return
    window.open(resolvedBlobUrl, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[920px] max-h-[90vh] overflow-hidden flex flex-col p-6">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-6">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Eye className="h-5 w-5 text-primary" /> {previewTitle}
              </DialogTitle>
              <DialogDescription className="break-all mt-1">
                {doc?.description || 'Standard bidding document requirement definition.'}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  doc?.envelope === 2
                    ? 'bg-warning/10 text-warning border-warning/20'
                    : 'bg-info/10 text-info border-info/20'
                }
              >
                {envelopeLabel}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Content Viewer */}
        <div className="rounded-md border bg-muted/20 overflow-hidden flex-1 min-h-[450px] max-h-[68vh] flex flex-col my-3">
          {!hasTemplateAttached ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground my-auto">
              <FileText className="h-16 w-16 text-muted-foreground/40 mb-3" />
              <h4 className="font-semibold text-foreground text-base">
                No Standard Template Attached
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mt-1.5">
                This master document type is registered as a requirement without a pre-configured template file. Bidders will submit their own document.
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground my-auto">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
              <p className="text-sm font-medium text-foreground">
                Loading template file...
              </p>
            </div>
          ) : hasError ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-destructive my-auto">
              <AlertTriangle className="h-12 w-12 text-destructive/80 mb-3" />
              <h4 className="font-semibold text-foreground text-base">
                Template File Unavailable
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mt-1.5">
                The attached template file could not be retrieved from secure storage.
              </p>
            </div>
          ) : isPdf && resolvedBlobUrl ? (
            <div className="flex-1 w-full h-full min-h-[500px]">
              <iframe
                src={resolvedBlobUrl}
                title={resolvedFileName || previewTitle}
                className="w-full h-full min-h-[500px] bg-background border-0"
              />
            </div>
          ) : isImage && resolvedBlobUrl ? (
            <div className="flex h-full min-h-[450px] items-center justify-center bg-background p-4 overflow-auto">
              <img
                src={resolvedBlobUrl}
                alt={resolvedFileName || previewTitle}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-10 text-center my-auto bg-background">
              <div className="mb-4">
                {getFileIcon(detectedType, resolvedFileName)}
              </div>
              <h4 className="font-bold text-foreground text-lg">
                {resolvedFileName || `${previewTitle} Template`}
              </h4>
              {fileSizeBytes && (
                <p className="text-xs text-muted-foreground mt-1">
                  Size: {formatBytes(fileSizeBytes)}
                </p>
              )}
              <p className="text-xs text-muted-foreground max-w-md mt-2">
                This template format ({detectedType || 'Desktop Document'}) can be downloaded and opened directly in your office application.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <Button
                  variant="default"
                  className="gap-2"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" /> Download Template
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleOpenNewTab}
                >
                  <ExternalLink className="h-4 w-4" /> Open in New Tab
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
          <div>
            {resolvedBlobUrl && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleDownload}
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleOpenNewTab}
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open
                </Button>
              </div>
            )}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

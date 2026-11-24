import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react'
import api from '@/services/api'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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

export interface PreviewableDocument {
  id?: string
  name: string
  url?: string
  type?: string
  size?: number
}

interface DocumentPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: PreviewableDocument | null
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  document: doc,
}: DocumentPreviewDialogProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [resolvedType, setResolvedType] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    let createdUrl: string | null = null

    if (!open || !doc || !doc.url) {
      setBlobUrl(null)
      setResolvedType('')
      setError(null)
      setIsLoading(false)
      return
    }

    const trimmedUrl = doc.url.trim()

    // 1. Direct Blob or Data URL
    if (trimmedUrl.startsWith('blob:') || trimmedUrl.startsWith('data:')) {
      setBlobUrl(trimmedUrl)
      const isPdf =
        doc.type?.toLowerCase() === 'pdf' || doc.name.toLowerCase().endsWith('.pdf')
      const isImg =
        doc.type?.toLowerCase().startsWith('image') ||
        /\.(png|jpe?g|gif|webp|svg)$/i.test(doc.name)
      setResolvedType(isPdf ? 'application/pdf' : isImg ? 'image/*' : 'application/octet-stream')
      return
    }

    // 2. Fetch authenticated blob
    const fetchBlob = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const uuidRegex =
          /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
        const match = trimmedUrl.match(uuidRegex)
        const endpoint = match ? `/files/download/${match[0]}` : trimmedUrl

        const response = await api.get<Blob>(endpoint, {
          responseType: 'blob',
        })

        if (!active) return

        if (!response.data || response.data.size === 0) {
          throw new Error('The retrieved file is empty.')
        }

        const headerContentType = response.headers['content-type'] as string | undefined
        const contentType =
          headerContentType && headerContentType !== 'application/octet-stream'
            ? headerContentType
            : doc.type?.toLowerCase() === 'pdf' || doc.name.toLowerCase().endsWith('.pdf')
            ? 'application/pdf'
            : doc.type?.toLowerCase() === 'docx' || doc.name.toLowerCase().endsWith('.docx')
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : doc.type?.toLowerCase() === 'xlsx' || doc.name.toLowerCase().endsWith('.xlsx')
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : headerContentType || 'application/octet-stream'

        const blob = new Blob([response.data], { type: contentType })
        createdUrl = URL.createObjectURL(blob)

        setResolvedType(contentType)
        setBlobUrl(createdUrl)
      } catch (err: unknown) {
        if (!active) return
        console.error('Failed to load document preview:', err)
        setError(err instanceof Error ? err.message : 'Unable to retrieve the file from storage.')
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void fetchBlob()

    return () => {
      active = false
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl)
      }
    }
  }, [open, doc])

  const handleDownload = () => {
    if (!blobUrl || !doc) return
    const link = window.document.createElement('a')
    link.href = blobUrl
    link.download = doc.name || 'document'
    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
  }

  const isPdf =
    resolvedType === 'application/pdf' ||
    doc?.type?.toLowerCase() === 'pdf' ||
    doc?.name.toLowerCase().endsWith('.pdf')

  const isImage =
    resolvedType.startsWith('image/') ||
    doc?.type?.toLowerCase().startsWith('image') ||
    /\.(png|jpe?g|gif|webp|svg)$/i.test(doc?.name || '')

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return ''
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl w-[95vw] h-[88vh] p-0 flex flex-col gap-0 overflow-hidden z-[1000] border-default-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <DialogHeader className="px-5 py-3 border-b border-default-200 bg-default-50/70 flex flex-row items-center justify-between shrink-0 space-y-0">
          <div className="flex items-center gap-3 overflow-hidden pr-4">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              {isPdf ? (
                <FileText className="h-5 w-5 text-red-600" />
              ) : isImage ? (
                <ImageIcon className="h-5 w-5 text-blue-600" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
            </div>
            <div className="space-y-0.5 overflow-hidden">
              <DialogTitle className="text-sm font-bold truncate text-default-900" title={doc?.name}>
                {doc?.name || 'Document Preview'}
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground flex items-center gap-2">
                <span>{isPdf ? 'PDF Document' : isImage ? 'Image Document' : doc?.type?.toUpperCase() || 'Attached File'}</span>
                {doc?.size ? (
                  <>
                    <span>•</span>
                    <span>{formatFileSize(doc.size)}</span>
                  </>
                ) : null}
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {blobUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="h-8 text-xs gap-1.5 font-medium"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 min-h-0 bg-default-100/60 relative overflow-hidden flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs font-medium">Loading document preview...</p>
            </div>
          ) : error ? (
            <div className="p-6 max-w-md w-full">
              <Alert variant="outline" color="destructive" className="bg-white border-destructive/30">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-xs font-bold">Unable to Preview Document</AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  {error}
                </AlertDescription>
              </Alert>
            </div>
          ) : !blobUrl ? (
            <div className="text-center text-muted-foreground p-8 space-y-2">
              <FileText className="h-10 w-10 mx-auto text-default-300" />
              <p className="text-xs">No preview available for this document.</p>
            </div>
          ) : isPdf ? (
            <iframe
              src={blobUrl}
              title={doc?.name || 'Document Preview'}
              className="w-full h-full border-0 bg-white"
            />
          ) : isImage ? (
            <div className="w-full h-full overflow-auto flex items-center justify-center p-4 bg-slate-900/5">
              <img
                src={blobUrl}
                alt={doc?.name || 'Preview'}
                className="max-h-full max-w-full object-contain rounded shadow-sm"
              />
            </div>
          ) : (
            /* Fallback card for non-inline previewable files */
            <div className="max-w-md w-full bg-white p-8 rounded-xl border border-default-200 shadow-sm text-center space-y-4 m-4">
              <div className="h-14 w-14 rounded-full bg-default-100 flex items-center justify-center mx-auto text-default-500">
                <FileText className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-default-900 truncate" title={doc?.name}>
                  {doc?.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Inline preview is not supported for this file format in the browser. You can download the file to inspect it.
                </p>
              </div>
              <Button onClick={handleDownload} className="font-semibold gap-1.5 text-xs">
                <Download className="h-4 w-4" />
                Download Document
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-5 py-2.5 bg-default-50/70 border-t border-default-200 flex items-center justify-between sm:justify-between shrink-0">
          <Badge variant="outline" className="text-[10px] text-muted-foreground bg-white">
            Bid Evaluation Workspace
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs font-medium"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

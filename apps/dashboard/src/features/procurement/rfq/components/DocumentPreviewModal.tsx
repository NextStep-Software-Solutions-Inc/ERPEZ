import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Download,
  ExternalLink,
  FileText,
  ImageIcon,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react'
import { fetchDocumentBlob, type DocumentBlobResult } from '@/features/procurement/manage-supplier-portal/utils/previewDocument'

export interface DocumentPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  url?: string | null
  title?: string
  fileName?: string
  fileType?: string
}

export function DocumentPreviewModal({
  open,
  onOpenChange,
  url,
  title,
  fileName,
  fileType,
}: DocumentPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [blobResult, setBlobResult] = useState<DocumentBlobResult | null>(null)
  const activeBlobUrlRef = useRef<string | null>(null)

  const cleanupBlob = () => {
    if (activeBlobUrlRef.current && activeBlobUrlRef.current.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(activeBlobUrlRef.current)
      } catch {
        // Ignore revocation errors
      }
      activeBlobUrlRef.current = null
    }
  }

  const loadDocument = async () => {
    if (!url || !open) return
    setIsLoading(true)
    setError(null)
    cleanupBlob()
    setBlobResult(null)

    try {
      const result = await fetchDocumentBlob(url, fileName, fileType)
      activeBlobUrlRef.current = result.blobUrl
      setBlobResult(result)
    } catch (err: any) {
      console.error('Failed to load document preview:', err)
      setError(err?.message || 'Failed to load document preview. Please check network connection or try downloading directly.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open && url) {
      void loadDocument()
    } else {
      cleanupBlob()
      setBlobResult(null)
      setError(null)
    }

    return () => {
      cleanupBlob()
    }
  }, [open, url])

  const handleDownload = () => {
    if (!blobResult) return
    const link = document.createElement('a')
    link.href = blobResult.blobUrl
    link.download = blobResult.fileName || fileName || 'document.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenInNewTab = () => {
    if (!blobResult?.blobUrl) return
    window.open(blobResult.blobUrl, '_blank')
  }

  const resolvedTitle = title || fileName || 'Document Preview'
  const displayFileName = blobResult?.fileName || fileName || 'Document'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="3xl"
        className="max-w-6xl w-[96vw] h-[88vh] max-h-[88vh] p-0 flex flex-col gap-0 overflow-hidden bg-background rounded-xl shadow-2xl border"
        hiddenCloseIcon
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b flex items-center justify-between bg-muted/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
              {blobResult?.isImage ? (
                <ImageIcon className="w-4 h-4" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-semibold truncate leading-tight">
                {resolvedTitle}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground truncate max-w-[320px]">
                  {displayFileName}
                </span>
                {blobResult?.isPdf && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-200 bg-blue-50 text-blue-700">
                    PDF
                  </Badge>
                )}
                {blobResult?.isImage && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-200 bg-emerald-50 text-emerald-700">
                    IMAGE
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {blobResult?.blobUrl && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="h-8 gap-1.5 text-xs font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenInNewTab}
                  title="Open in new tab"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-md"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 w-full min-h-0 relative overflow-hidden bg-slate-100 flex flex-col items-center justify-center">
          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <div className="text-sm font-medium">Loading brochure preview...</div>
              <div className="text-xs text-muted-foreground">Fetching document data securely</div>
            </div>
          )}

          {!isLoading && error && (
            <div className="p-6 max-w-md w-full text-center space-y-4">
              <Alert color="destructive" variant="soft" className="text-left">
                <AlertTitle className="text-sm font-semibold">Unable to preview document</AlertTitle>
                <AlertDescription className="text-xs mt-1">{error}</AlertDescription>
              </Alert>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadDocument}
                  className="gap-1.5 text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {!isLoading && !error && blobResult && (
            <>
              {blobResult.isPdf ? (
                <iframe
                  src={`${blobResult.blobUrl}#toolbar=1&navpanes=0`}
                  className="w-full h-full border-0 flex-1 bg-slate-50"
                  title={resolvedTitle}
                />
              ) : blobResult.isImage ? (
                <div className="flex-1 w-full h-full flex items-center justify-center p-6 bg-slate-950/5 overflow-auto">
                  <img
                    src={blobResult.blobUrl}
                    alt={resolvedTitle}
                    className="max-w-full max-h-full object-contain rounded-md shadow-md border bg-white"
                  />
                </div>
              ) : (
                <div className="p-8 max-w-sm text-center space-y-4 bg-white rounded-xl shadow-sm border m-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{displayFileName}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      This document format cannot be previewed inline in the browser.
                    </p>
                  </div>
                  <Button onClick={handleDownload} className="gap-2 text-xs w-full">
                    <Download className="w-3.5 h-3.5" />
                    Download File to View
                  </Button>
                </div>
              )}
            </>
          )}

          {!isLoading && !error && !blobResult && (
            <div className="text-xs text-muted-foreground">
              No document to preview.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

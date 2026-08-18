/**
 * Document Preview Modal Component
 * Displays images, PDFs, and document cards in a popover modal dialog without navigating away
 * Location: src/features/planning/market-scoping/dialogs/
 */

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, ExternalLink, FileCheck, FileText, Image as ImageIcon, File, Loader2, AlertTriangle } from 'lucide-react'
import type { FileAttachment } from '../types/marketScopingTypes'
import api from '@/services/api'

interface DocumentPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  attachment: FileAttachment | null
}

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
const PDF_TYPES = ['application/pdf']

function isImageFile(fileType?: string, fileName?: string, blobType?: string): boolean {
  if (blobType && blobType.startsWith('image/')) return true
  return IMAGE_TYPES.includes(fileType || '') || /\.(png|jpe?g|gif|webp)$/i.test(fileName || '')
}

function isPdfFile(fileType?: string, fileName?: string, blobType?: string): boolean {
  if (blobType === 'application/pdf') return true
  return PDF_TYPES.includes(fileType || '') || /\.pdf$/i.test(fileName || '')
}

function formatFileSize(bytes?: number) {
  if (!bytes) return ''
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  attachment,
}: DocumentPreviewModalProps) {
  const [resolvedBlobUrl, setResolvedBlobUrl] = useState<string | null>(null)
  const [detectedBlobType, setDetectedBlobType] = useState<string | null>(null)
  const [isLoadingBlob, setIsLoadingBlob] = useState(false)
  const [fileNotFound, setFileNotFound] = useState(false)

  useEffect(() => {
    if (!attachment || !isOpen) {
      setResolvedBlobUrl(null)
      setDetectedBlobType(null)
      setFileNotFound(false)
      return
    }

    const rawUrl = attachment.fileUrl || ''

    // If fileUrl is already a Blob URL or Data URI or full HTTP URL, use it directly
    if (
      rawUrl.startsWith('blob:') ||
      rawUrl.startsWith('data:') ||
      rawUrl.startsWith('http://') ||
      rawUrl.startsWith('https://')
    ) {
      setResolvedBlobUrl(rawUrl)
      setFileNotFound(false)
      return
    }

    // Attempt to fetch binary blob using candidate file IDs
    const fetchFileBlob = async () => {
      const candidateIds = [attachment.fileUrl, attachment.id].filter(Boolean) as string[]
      let fileBlob: Blob | null = null

      setIsLoadingBlob(true)
      setFileNotFound(false)
      try {
        for (let candidate of candidateIds) {
          if (candidate.startsWith('blob:') || candidate.startsWith('data:')) continue
          if (candidate.includes('/files/download/')) {
            candidate = candidate.split('/files/download/').pop() || candidate
          }
          if (!candidate || candidate.includes('/v2/')) continue

          try {
            const response = await api.get<Blob>(`/files/download/${candidate}`, {
              responseType: 'blob',
            })
            if (response.data && response.data.size > 0) {
              fileBlob = response.data
              break
            }
          } catch {
            // Candidate failed (404/error)
          }
        }

        if (fileBlob) {
          const objectUrl = URL.createObjectURL(fileBlob)
          setResolvedBlobUrl(objectUrl)
          setDetectedBlobType(fileBlob.type || null)
          setFileNotFound(false)
        } else {
          setResolvedBlobUrl(null)
          setFileNotFound(true)
        }
      } finally {
        setIsLoadingBlob(false)
      }
    }

    fetchFileBlob()

    return () => {
      if (resolvedBlobUrl && resolvedBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(resolvedBlobUrl)
      }
    }
  }, [attachment, isOpen])

  if (!attachment) return null

  const { fileName, fileSize, fileType } = attachment
  const isImage = isImageFile(fileType, fileName, detectedBlobType || undefined)
  const isPdf = isPdfFile(fileType, fileName, detectedBlobType || undefined)

  const activeUrl = resolvedBlobUrl
  const canRenderPdf = isPdf && Boolean(activeUrl)
  const canRenderImage = isImage && Boolean(activeUrl)

  const handleDownload = async () => {
    if (activeUrl) {
      const link = document.createElement('a')
      link.href = activeUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    }

    const candidateIds = [attachment.fileUrl, attachment.id].filter(Boolean) as string[]
    for (let candidate of candidateIds) {
      if (candidate.includes('/files/download/')) {
        candidate = candidate.split('/files/download/').pop() || candidate
      }
      try {
        const response = await api.get<Blob>(`/files/download/${candidate}`, {
          responseType: 'blob',
        })
        const blob = response.data
        if (blob && blob.size > 0) {
          const blobUrl = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = blobUrl
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
          break
        }
      } catch (err) {
        console.error('Download candidate failed:', err)
      }
    }
  }

  const handleOpenExternal = () => {
    if (activeUrl) {
      window.open(activeUrl, '_blank')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[880px] w-[92vw] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-background border rounded-xl shadow-xl [&>button:last-child]:top-3.5 [&>button:last-child]:right-3.5 [&>button:last-child]:z-20 [&>button:last-child]:bg-slate-100/80 [&>button:last-child]:hover:bg-slate-200 [&>button:last-child]:rounded-full [&>button:last-child]:p-1 text-slate-500 [&>button:last-child]:hover:text-slate-900 [&>button:last-child]:transition-all">
        {/* Header */}
        <DialogHeader className="p-4 px-6 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary flex-shrink-0">
              {isImage ? (
                <ImageIcon className="w-5 h-5 text-indigo-600" />
              ) : isPdf ? (
                <FileText className="w-5 h-5 text-red-500" />
              ) : (
                <File className="w-5 h-5 text-amber-500" />
              )}
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold text-foreground truncate" title={fileName}>
                {fileName}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate">
                Uploaded supporting attachment
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 pr-10">
            {activeUrl && (
              <Button
                onClick={handleOpenExternal}
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs gap-1.5"
                title="Open in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Tab</span>
              </Button>
            )}
            <Button
              onClick={handleDownload}
              size="sm"
              disabled={fileNotFound && !activeUrl}
              className="h-8 px-3 text-xs gap-1.5 shadow-xs bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Content Viewer Body */}
        <div className="flex-1 bg-muted/10 overflow-hidden flex items-center justify-center p-4 min-h-[420px]">
          {isLoadingBlob ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-sm font-medium text-muted-foreground">Loading document preview...</p>
            </div>
          ) : canRenderPdf && activeUrl ? (
            <iframe
              src={activeUrl}
              title={fileName}
              className="h-[65vh] w-full bg-background rounded-md border"
            />
          ) : canRenderImage && activeUrl ? (
            <div className="flex h-[65vh] w-full items-center justify-center bg-background rounded-md border p-4">
              <img
                src={activeUrl}
                alt={fileName}
                className="max-h-full max-w-full object-contain rounded-sm"
              />
            </div>
          ) : (
            /* Safe Document Info Card */
            <div className="w-full max-w-[600px] bg-background border rounded-xl p-8 shadow-xs space-y-6">
              <div className="flex items-start justify-between gap-4 border-b pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Attachment Details
                  </span>
                  <h3 className="text-lg font-bold text-foreground mt-1 break-all">
                    {fileName}
                  </h3>
                  {fileSize ? (
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      Size: {formatFileSize(fileSize)}
                    </p>
                  ) : null}
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <FileCheck className="h-6 w-6" />
                </div>
              </div>

              <div className="space-y-4">
                {fileNotFound ? (
                  <div className="flex items-start gap-3 rounded-lg border bg-amber-50/70 border-amber-200/80 p-4">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-amber-900">
                        File not found in storage
                      </p>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        This attachment entry exists in the database, but the physical file is missing from file storage (common for seed/test data).
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 rounded-lg border bg-blue-50/70 border-blue-200/80 p-4">
                    <FileText className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-blue-900">
                        Spreadsheet / Document File
                      </p>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        Non-PDF/Image files (such as Excel `.xlsx` or Word `.docx` spreadsheets) cannot be rendered inline by the browser. Click <strong>Download</strong> to view the file.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Document Name
                    </span>
                    <div className="rounded-md border bg-muted/10 p-2.5 text-xs font-medium text-foreground truncate">
                      {fileName}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      File Type
                    </span>
                    <div className="rounded-md border bg-muted/10 p-2.5 text-xs font-medium text-foreground">
                      {fileType || detectedBlobType || (fileName.endsWith('.xlsx') ? 'Excel Spreadsheet' : fileName.endsWith('.docx') ? 'Word Document' : 'Data Attachment')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-3 px-6 border-t bg-background">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

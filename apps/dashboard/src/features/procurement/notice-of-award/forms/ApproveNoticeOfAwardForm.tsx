import { useState, useRef } from 'react'
import { Upload, FileCheck, Eye, X, AlertCircle, ShieldCheck, Building2, Coins, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { ApproveNoticeOfAwardPayload } from '../types'

export type ApproveNoticeOfAwardFormProps = {
  noaId: string
  noaNumber?: string
  supplierName?: string
  totalAmount?: number
  isLoading?: boolean
  onSubmit: (values: ApproveNoticeOfAwardPayload) => Promise<void> | void
  onCancel: () => void
  onDirtyChange?: (isDirty: boolean) => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function ApproveNoticeOfAwardForm({
  noaId,
  noaNumber,
  supplierName,
  totalAmount,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: ApproveNoticeOfAwardFormProps) {
  const [signedDocument, setSignedDocument] = useState<File | null>(null)
  const [customFileName, setCustomFileName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateAndSetFile = (file: File) => {
    setError(null)
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      setError('Only PDF documents are accepted.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.')
      return
    }

    setSignedDocument(file)
    setCustomFileName(file.name)
    onDirtyChange?.(true)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoading) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (isLoading) return

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      validateAndSetFile(droppedFile)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      validateAndSetFile(selected)
    }
  }

  const handleRemoveFile = () => {
    setSignedDocument(null)
    setCustomFileName('')
    setError(null)
    onDirtyChange?.(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleViewPdf = () => {
    if (!signedDocument) return
    const url = URL.createObjectURL(signedDocument)
    window.open(url, '_blank')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!signedDocument || isLoading) return

    const rawName = customFileName?.trim() || signedDocument.name
    const finalFileName = rawName.toLowerCase().endsWith('.pdf') ? rawName : `${rawName}.pdf`
    const fileToSubmit =
      finalFileName === signedDocument.name
        ? signedDocument
        : new File([signedDocument], finalFileName, { type: signedDocument.type || 'application/pdf' })

    await onSubmit({
      noaId,
      signedDocument: fileToSubmit,
    })
    onDirtyChange?.(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
      {/* NOA Quick Summary Context */}
      {(noaNumber || supplierName || totalAmount !== undefined) && (
        <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3 text-xs space-y-1.5">
          <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
            <span>Notice of Award: {noaNumber}</span>
            {totalAmount !== undefined && (
              <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Coins className="h-3.5 w-3.5" />
                ₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>
          {supplierName && (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Winning Bidder: <strong className="text-slate-700 dark:text-slate-300">{supplierName}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Upload Dropzone Section */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Signed NOA Document (PDF) <span className="text-destructive">*</span>
        </Label>

        {signedDocument ? (
          /* Staged File Card */
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-200 truncate">
                    {signedDocument.name}
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    {formatFileSize(signedDocument.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleViewPdf}
                  className="h-8 text-xs gap-1.5 px-2.5 bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 shadow-2xs"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View PDF
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  disabled={isLoading}
                  className="h-8 w-8 text-slate-400 hover:text-destructive"
                  title="Remove document"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Document Rename Field */}
            <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40">
              <Label htmlFor="custom-noa-filename" className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                Document Display Name
              </Label>
              <Input
                id="custom-noa-filename"
                type="text"
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
                disabled={isLoading}
                placeholder="Enter document name"
                className="h-8 text-xs bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800/60"
              />
            </div>
          </div>
        ) : (
          /* Empty Dropzone */
          <div
            onClick={() => !isLoading && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'border-2 border-dashed rounded-xl p-7 text-center transition-all cursor-pointer select-none',
              isDragging
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 hover:border-primary/60 hover:bg-slate-50 dark:hover:bg-slate-900/60',
              error && 'border-destructive/60 bg-destructive/5'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileInputChange}
              disabled={isLoading}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mb-0.5">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                <span className="text-primary hover:underline">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                HoPE-signed NOA (PDF only · Maximum 10MB)
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-destructive mt-1.5">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Compliance / Legal Notice */}
      <div className="rounded-lg border border-blue-200/80 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/20 p-3 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-blue-950 dark:text-blue-100">Executive Approval Notice</p>
          <p className="text-[11px] text-blue-800/90 dark:text-blue-300 leading-relaxed">
            By approving this Notice of Award, you certify that the procurement process conforms with RA 12009 and the approved BAC Resolution. The document will be officially stamped as issued.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!signedDocument || isLoading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1.5"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Approving & Issuing...
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Approve & Issue NOA
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

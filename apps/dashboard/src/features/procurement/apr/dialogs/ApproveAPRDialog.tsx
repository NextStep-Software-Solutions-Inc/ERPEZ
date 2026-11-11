/**
 * Approve APR Dialog
 * Dialog for approving APR and uploading signed document
 */

import { useState } from 'react'
import { CheckCircle, Upload, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface ApproveAPRDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apr: any | null
  isSubmitting?: boolean
  onConfirm?: (file?: File) => void | Promise<void>
}

export function ApproveAPRDialog({
  open,
  onOpenChange,
  apr,
  isSubmitting = false,
  onConfirm,
}: ApproveAPRDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  if (!apr) return null

  const itemsCount = apr.consolidatedItems?.length ?? apr.itemCount ?? apr.totalItemsCount ?? 0
  const totalAmount = apr.totalAmount ?? 0

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setSelectedFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm(selectedFile || undefined)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setIsDragging(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve APR</DialogTitle>
          <DialogDescription>
            Approve this APR and optionally upload the signed document.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Success Preview */}
          <div className="bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/35 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-emerald-900 dark:text-emerald-200">Ready to Approve</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300/90 mt-1">
                {apr.aprNumber} will be marked as approved
              </p>
            </div>
          </div>

          {/* APR Details */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-border rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Items:</span>
              <span className="font-medium text-foreground">{itemsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-medium text-foreground tabular-nums">
                ₱{new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalAmount)}
              </span>
            </div>
            {apr.fiscalYear && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fiscal Year:</span>
                <span className="font-medium text-foreground">{apr.fiscalYear}</span>
              </div>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Signed APR Document <span className="text-muted-foreground">(Optional)</span>
            </label>

            {selectedFile ? (
              <div className="bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/35 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium text-sm text-blue-900 dark:text-blue-200">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedFile(null)}
                  disabled={isSubmitting}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  isDragging
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-500/15'
                    : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 bg-slate-50/40 dark:bg-slate-900/40'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="apr-file-input"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="apr-file-input"
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Drag and drop your PDF here
                    </p>
                    <p className="text-xs text-muted-foreground">or click to browse</p>
                  </div>
                </label>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              PDF format preferred. Maximum 50 MB.
            </p>
          </div>
        </div>

        {/* Actions */}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSubmitting ? 'Approving...' : 'Approve APR'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

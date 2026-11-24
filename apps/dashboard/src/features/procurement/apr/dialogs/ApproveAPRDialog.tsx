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
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-green-900">Ready to Approve</p>
              <p className="text-sm text-green-700 mt-1">
                {apr.aprNumber} will be marked as approved
              </p>
            </div>
          </div>

          {/* APR Details */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Items:</span>
              <span className="font-medium">{itemsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium">
                ₱{new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalAmount)}
              </span>
            </div>
            {apr.fiscalYear && (
              <div className="flex justify-between">
                <span className="text-gray-600">Fiscal Year:</span>
                <span className="font-medium">{apr.fiscalYear}</span>
              </div>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Signed APR Document <span className="text-gray-500">(Optional)</span>
            </label>

            {selectedFile ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm text-blue-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-blue-700">
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
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
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
                  <Upload className="h-6 w-6 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Drag and drop your PDF here
                    </p>
                    <p className="text-xs text-gray-500">or click to browse</p>
                  </div>
                </label>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
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
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? 'Approving...' : 'Approve APR'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

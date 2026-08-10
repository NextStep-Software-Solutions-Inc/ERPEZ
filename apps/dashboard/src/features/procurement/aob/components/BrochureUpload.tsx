/**
 * Brochure Upload & Preview Component
 * Manage brochure documents for suppliers and bids
 * Supports upload, view, and delete operations
 */

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Upload, FileText, Eye, Trash2, AlertCircle, CheckCircle } from 'lucide-react'
import type { SupplierBid } from '../types/aobTypes'

interface BrochureFile {
  id: string
  fileName: string
  fileSize: number
  uploadedAt: string
  fileType: 'document' | 'image' | 'other'
  url?: string
}

interface BrochureUploadProps {
  bid: SupplierBid
  brochures?: BrochureFile[]
  onUpload?: (file: File) => void
  onDelete?: (fileId: string) => void
  readOnly?: boolean
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get file type from extension
 */
function getFileTypeIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'].includes(ext || '')) return '📄'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return '📷'
  return '📎'
}

export function BrochureUpload({
  bid,
  brochures = [],
  onUpload,
  onDelete,
  readOnly = false,
}: BrochureUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const validateFile = useCallback((file: File): boolean => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['application/pdf', 'application/msword', 'image/jpeg', 'image/png']

    if (file.size > maxSize) {
      setUploadError(`File size exceeds 10MB limit. (${formatFileSize(file.size)})`)
      return false
    }

    if (!allowedTypes.includes(file.type)) {
      setUploadError('File type not supported. Please upload PDF, Word, JPEG, or PNG files.')
      return false
    }

    return true
  }, [])

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      setUploadError(null)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        if (validateFile(file)) {
          onUpload?.(file)
        }
      }
    },
    [onUpload, validateFile]
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUploadError(null)
      const files = e.currentTarget.files
      if (files && files.length > 0) {
        const file = files[0]
        if (validateFile(file)) {
          onUpload?.(file)
        }
      }
    },
    [onUpload, validateFile]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Brochure & Documents</CardTitle>
        <CardDescription>
          {bid.supplierName} - {bid.lineItemId}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        {!readOnly && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              Drop brochure here or click to browse
            </p>
            <p className="text-xs text-gray-600 mb-3">
              PDF, Word, JPEG, PNG • Max 10MB
            </p>
            <label>
              <input
                type="file"
                onChange={handleFileInputChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
              />
              <Button size="sm" variant="outline" asChild>
                <span>Select File</span>
              </Button>
            </label>
          </div>
        )}

        {/* Error Message */}
        {uploadError && (
          <Alert variant="soft">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {/* Uploaded Files List */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">
            {brochures.length === 0 ? 'No documents uploaded' : `${brochures.length} Document(s)`}
          </h4>

          {brochures.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {brochures.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                      <span className="text-xl">{getFileTypeIcon(file.fileName)}</span>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.fileName}</p>
                    <p className="text-xs text-gray-600">
                      {formatFileSize(file.fileSize)} • Uploaded{' '}
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {}}
                            title="View document"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-96">
                          <DialogHeader>
                            <DialogTitle>{file.fileName}</DialogTitle>
                            <DialogDescription>
                              {formatFileSize(file.fileSize)} • {file.fileType}
                            </DialogDescription>
                          </DialogHeader>

                          {/* Document Preview */}
                          <div className="bg-gray-100 rounded p-4 min-h-64 flex items-center justify-center">
                            {file.fileType === 'image' && file.url ? (
                              <img
                                src={file.url}
                                alt={file.fileName}
                                className="max-w-full max-h-80 rounded"
                              />
                            ) : file.fileType === 'document' ? (
                              <div className="text-center">
                                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600">Document preview not available</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-3"
                                  onClick={() =>
                                    file.url && window.open(file.url, '_blank')
                                  }
                                >
                                  Open in New Tab
                                </Button>
                              </div>
                            ) : (
                              <div className="text-center">
                                <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600">
                                  File preview not available
                                </p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                    {/* Delete Button */}
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete?.(file.id)}
                        title="Delete document"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Status */}
        {brochures.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-700">
              All brochures uploaded successfully
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

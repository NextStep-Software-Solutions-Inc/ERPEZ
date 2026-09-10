/**
 * Attachment Viewer Component
 * Displays file attachments with view and download capabilities
 * Location: src/features/planning/market-scoping/components/
 */

import { useState } from 'react'
import {
  FileText,
  Image as ImageIcon,
  Download,
  File,
  Eye,
  X,
} from 'lucide-react'
import type { FileAttachment } from '../types/marketScopingTypes'
import { DocumentPreviewModal } from '../dialogs/DocumentPreviewModal'
import api from '@/services/api'

interface AttachmentViewerProps {
  attachments: FileAttachment[]
  showLabel?: boolean
  compact?: boolean
  onRemove?: (attachmentId: string) => void
  onRename?: (attachmentId: string, newName: string) => void
}

const IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
]
const PDF_TYPES = ['application/pdf']

function getFileIcon(fileType?: string, fileName?: string) {
  const isImage =
    IMAGE_TYPES.includes(fileType || '') ||
    /\.(png|jpe?g|gif|webp)$/i.test(fileName || '')
  const isPdf =
    PDF_TYPES.includes(fileType || '') || /\.pdf$/i.test(fileName || '')

  if (isImage) return <ImageIcon className="w-4 h-4 text-blue-500" />
  if (isPdf) return <FileText className="w-4 h-4 text-red-500" />
  return <File className="w-4 h-4 text-gray-500" />
}

function formatFileSize(bytes?: number) {
  if (!bytes) return ''
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export function AttachmentViewer({
  attachments,
  showLabel = true,
  compact = false,
  onRemove,
  onRename,
}: AttachmentViewerProps) {
  const [previewAttachment, setPreviewAttachment] =
    useState<FileAttachment | null>(null)

  if (!attachments || attachments.length === 0) {
    return null
  }

  const handleView = (attachment: FileAttachment, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setPreviewAttachment(attachment)
  }

  const handleDownload = async (
    attachment: FileAttachment,
    e?: React.MouseEvent,
  ) => {
    if (e) e.stopPropagation()
    const rawUrl = attachment.fileUrl || ''
    if (rawUrl.startsWith('blob:') || rawUrl.startsWith('data:')) {
      const link = document.createElement('a')
      link.href = rawUrl
      link.download = attachment.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    }

    const candidateIds = [attachment.fileUrl, attachment.id].filter(
      (id): id is string => Boolean(id),
    )
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
          link.download = attachment.fileName
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

  if (compact) {
    return (
      <>
        <div className="flex flex-wrap gap-2">
          {attachments.map((file) => (
            <div
              key={file.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md text-xs font-medium transition-colors"
            >
              {getFileIcon(file.fileType, file.fileName)}
              <span className="truncate max-w-xs text-gray-800">
                {file.fileName}
              </span>
              <button
                onClick={(e) => handleView(file, e)}
                className="ml-1 p-0.5 text-gray-500 hover:text-blue-600 transition-colors"
                title="View file"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => handleDownload(file, e)}
                className="p-0.5 text-gray-500 hover:text-blue-600 transition-colors"
                title="Download file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <DocumentPreviewModal
          isOpen={!!previewAttachment}
          onClose={() => setPreviewAttachment(null)}
          attachment={previewAttachment}
        />
      </>
    )
  }

  return (
    <>
      <div className="space-y-2.5 w-full">
        {showLabel && (
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Attachments ({attachments.length})
          </p>
        )}
        <div className="flex flex-col space-y-2 w-full">
          {attachments.map((file) => (
            <div
              key={file.id}
              className="group flex items-center justify-between gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="p-2 bg-gray-50 rounded-md border border-gray-100 flex-shrink-0">
                  {getFileIcon(file.fileType, file.fileName)}
                </div>
                <div className="flex-1 min-w-0">
                  {onRename ? (
                    <input
                      type="text"
                      value={file.fileName}
                      onChange={(e) => onRename(file.id, e.target.value)}
                      className="text-sm font-medium text-gray-900 bg-transparent border-b border-dashed border-gray-300 hover:border-gray-500 focus:border-primary focus:outline-none w-full py-0.5"
                      placeholder="Enter document label..."
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <p
                      className="text-sm font-medium text-gray-800 truncate"
                      title={file.fileName}
                    >
                      {file.fileName}
                    </p>
                  )}
                  {file.fileSize ? (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatFileSize(file.fileSize)}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={(e) => handleView(file, e)}
                  className="px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md flex items-center gap-1 transition-colors"
                  title="View / Preview file popover"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
                <button
                  onClick={(e) => handleDownload(file, e)}
                  className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md flex items-center gap-1 transition-colors"
                  title="Download file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                {onRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemove(file.id)
                    }}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <DocumentPreviewModal
        isOpen={!!previewAttachment}
        onClose={() => setPreviewAttachment(null)}
        attachment={previewAttachment}
      />
    </>
  )
}

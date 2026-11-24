/**
 * Image Viewer Modal
 * Displays images in a modal with view and download options
 * Location: src/features/planning/market-scoping/dialogs/
 */

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'

interface ImageViewerModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  fileName: string
  fileSize?: number
}

export function ImageViewerModal({
  isOpen,
  onClose,
  imageUrl,
  fileName,
  fileSize,
}: ImageViewerModalProps) {
  const [isZoomed, setIsZoomed] = useState(false)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(2)} KB`
    return `${(kb / 1024).toFixed(2)} MB`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-black/95">
        <DialogHeader className="border-b border-gray-700">
          <div className="flex items-center justify-between w-full">
            <div>
              <DialogTitle className="text-white">{fileName}</DialogTitle>
              {fileSize && (
                <p className="text-sm text-gray-400 mt-1">
                  {formatFileSize(fileSize)}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          {/* Image Container */}
          <div
            className={`relative flex items-center justify-center bg-black rounded-lg overflow-hidden ${
              isZoomed ? 'w-full h-[70vh]' : 'max-w-2xl'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <img
              src={imageUrl}
              alt={fileName}
              className={`object-contain ${
                isZoomed ? 'w-full h-full' : 'max-w-full max-h-[60vh]'
              } cursor-pointer`}
            />
            {!isZoomed && (
              <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-2 rounded">
                Click to zoom
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center pt-4 border-t border-gray-700 w-full">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="bg-gray-700 hover:bg-gray-600 text-white border-0"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

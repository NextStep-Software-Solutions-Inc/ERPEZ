/**
 * APR Image Viewer Modal
 * 
 * Displays full-size catalog and item images in an interactive modal with zoom and download capabilities.
 * @module features/procurement/apr/components/APRImageViewerModal
 */

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, X, ZoomIn, ZoomOut, Image as ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface APRImageViewerModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl?: string | null
  itemTitle: string
  itemCode?: string
  unitPrice?: number
}

export function APRImageViewerModal({
  isOpen,
  onClose,
  imageUrl,
  itemTitle,
  itemCode,
  unitPrice,
}: APRImageViewerModalProps) {
  const [isZoomed, setIsZoomed] = useState(false)

  if (!imageUrl) return null

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `${itemCode || 'catalog-item'}-preview.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-slate-950/95 border-slate-800 text-white p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-slate-800 flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                <span>{itemTitle}</span>
              </DialogTitle>
              {itemCode && (
                <Badge variant="outline" className="text-xs font-mono bg-slate-800 text-slate-300 border-slate-700">
                  {itemCode}
                </Badge>
              )}
            </div>
            {unitPrice !== undefined && unitPrice > 0 && (
              <p className="text-xs text-emerald-400 font-semibold">
                Unit Price: ₱{unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        {/* Image Display Area */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-900/60 min-h-[350px] max-h-[65vh] overflow-auto">
          <div
            className={`relative flex items-center justify-center rounded-lg overflow-hidden transition-all duration-200 cursor-pointer ${
              isZoomed ? 'w-full max-h-none' : 'max-w-2xl max-h-[55vh]'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
            title="Click to toggle zoom"
          >
            <img
              src={imageUrl}
              alt={itemTitle}
              className={`object-contain rounded-md transition-all duration-200 ${
                isZoomed ? 'w-full h-auto scale-125 my-8' : 'max-w-full max-h-[50vh]'
              }`}
            />
            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
              <span>{isZoomed ? 'Click to Fit' : 'Click to Zoom'}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Authoritative product imagery from Procurement Service (PS-PhilGEPS)
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700 text-xs h-8 gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download Image
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              size="sm"
              className="text-xs h-8 px-4"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

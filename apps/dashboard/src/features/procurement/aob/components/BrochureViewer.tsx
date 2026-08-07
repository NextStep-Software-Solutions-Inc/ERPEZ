/**
 * Brochure Viewer Dialog
 * Displays item specifications and brochures from suppliers
 */

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, Download, X } from 'lucide-react'

interface BrochureViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemCode: string
  description: string
  brochureUrl?: string
  supplierBids?: Array<{
    supplierName: string
    offerUrl?: string
  }>
}

export function BrochureViewer({
  open,
  onOpenChange,
  itemCode,
  description,
  brochureUrl,
  supplierBids = [],
}: BrochureViewerProps) {
  const [selectedTab, setSelectedTab] = useState<'item' | 'supplier'>('item')

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Item Specifications & Bid Offers</DialogTitle>
          <DialogDescription>{itemCode} - {description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setSelectedTab('item')}
              className={`px-4 py-2 border-b-2 transition-colors ${
                selectedTab === 'item'
                  ? 'border-blue-500 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Item Specifications
            </button>
            {supplierBids.length > 0 && (
              <button
                onClick={() => setSelectedTab('supplier')}
                className={`px-4 py-2 border-b-2 transition-colors ${
                  selectedTab === 'supplier'
                    ? 'border-blue-500 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Supplier Bid Offers ({supplierBids.filter((b) => b.offerUrl).length})
              </button>
            )}
          </div>

          {/* Item Specifications Tab */}
          {selectedTab === 'item' && (
            <div className="space-y-3">
              {brochureUrl ? (
                <div className="border rounded-lg p-4 bg-blue-50 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Item Specification Document</p>
                      <p className="text-xs text-gray-600">{brochureUrl.split('/').pop()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(brochureUrl, '_blank')}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(brochureUrl, `${itemCode}-specifications.pdf`)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-gray-50 text-center">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No item specifications uploaded</p>
                </div>
              )}
            </div>
          )}

          {/* Supplier Bid Offers Tab */}
          {selectedTab === 'supplier' && (
            <div className="space-y-3">
              {supplierBids.filter((b) => b.offerUrl).length > 0 ? (
                supplierBids.map((item, index) => 
                  item.offerUrl ? (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-600" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.supplierName}</p>
                          <p className="text-xs text-gray-600">{item.offerUrl.split('/').pop()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(item.offerUrl, '_blank')}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Offer
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownload(item.offerUrl!, `${itemCode}-${item.supplierName}-offer.pdf`)
                          }
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : null
                )
              ) : (
                <div className="border rounded-lg p-4 bg-gray-50 text-center">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No supplier bid offers available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

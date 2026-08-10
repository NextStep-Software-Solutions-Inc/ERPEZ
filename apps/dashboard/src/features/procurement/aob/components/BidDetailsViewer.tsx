/**
 * Bid Details Viewer Dialog
 * Displays complete bidding details for a specific supplier-item combination
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, CheckCircle, AlertCircle } from 'lucide-react'

interface BidDetailsViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemCode: string
  itemDescription: string
  itemABC: number
  supplierName: string
  bidDetails: {
    unitBid: number | null
    totalBid: number | null
    qualityScore?: number
    calculatedQualityPriceRatio?: number
    remarks?: string
    offerDocumentUrl?: string
    isWinner?: boolean
  }
}

export function BidDetailsViewer({
  open,
  onOpenChange,
  itemCode,
  itemDescription,
  itemABC,
  supplierName,
  bidDetails,
}: BidDetailsViewerProps) {
  const exceedsABC = bidDetails.totalBid && bidDetails.totalBid > itemABC

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bid Details - {supplierName}</DialogTitle>
          <DialogDescription>
            {itemCode} - {itemDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bid Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Item ABC */}
            <div className="border rounded-lg p-4 space-y-2 bg-blue-50">
              <p className="text-xs font-medium text-gray-600">Approved Budget (ABC)</p>
              <p className="text-2xl font-bold text-blue-900">
                ₱{itemABC.toLocaleString()}
              </p>
            </div>

            {/* Unit Bid */}
            <div className="border rounded-lg p-4 space-y-2 bg-gray-50">
              <p className="text-xs font-medium text-gray-600">Unit Price</p>
              {bidDetails.unitBid ? (
                <p className="text-2xl font-bold text-gray-900">
                  ₱{bidDetails.unitBid.toLocaleString()}
                </p>
              ) : (
                <p className="text-xl font-bold text-gray-400">No Bid</p>
              )}
            </div>

            {/* Total Bid */}
            <div className={`border rounded-lg p-4 space-y-2 ${
              exceedsABC ? 'bg-red-50' : 'bg-green-50'
            }`}>
              <p className="text-xs font-medium text-gray-600">Total Bid Amount</p>
              {bidDetails.totalBid ? (
                <div className="space-y-2">
                  <p className={`text-2xl font-bold ${
                    exceedsABC ? 'text-red-900' : 'text-green-900'
                  }`}>
                    ₱{bidDetails.totalBid.toLocaleString()}
                  </p>
                  {exceedsABC && (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-xs text-red-600 font-medium">Exceeds ABC</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xl font-bold text-gray-400">No Bid</p>
              )}
            </div>

            {/* Status */}
            <div className="border rounded-lg p-4 space-y-2 bg-amber-50">
              <p className="text-xs font-medium text-gray-600">Status</p>
              {bidDetails.isWinner ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-amber-600" />
                  <Badge className="bg-amber-600">Winner</Badge>
                </div>
              ) : (
                <p className="text-sm text-gray-600">Not Selected</p>
              )}
            </div>
          </div>

          {/* Additional Details */}
          {(bidDetails.qualityScore !== undefined || bidDetails.calculatedQualityPriceRatio !== undefined) && (
            <div className="border rounded-lg p-4 space-y-3 bg-purple-50">
              <p className="text-sm font-medium text-gray-700">Evaluation Scores</p>
              <div className="grid grid-cols-2 gap-3">
                {bidDetails.qualityScore !== undefined && (
                  <div>
                    <p className="text-xs text-gray-600">Quality Score</p>
                    <p className="text-lg font-bold text-purple-900">
                      {bidDetails.qualityScore}%
                    </p>
                  </div>
                )}
                {bidDetails.calculatedQualityPriceRatio !== undefined && (
                  <div>
                    <p className="text-xs text-gray-600">Quality-Price Ratio</p>
                    <p className="text-lg font-bold text-purple-900">
                      {bidDetails.calculatedQualityPriceRatio.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Remarks */}
          {bidDetails.remarks && (
            <div className="border rounded-lg p-4 space-y-2 bg-gray-50">
              <p className="text-sm font-medium text-gray-700">Remarks</p>
              <p className="text-sm text-gray-600">{bidDetails.remarks}</p>
            </div>
          )}

          {/* Offer Document */}
          {bidDetails.offerDocumentUrl ? (
            <div className="border rounded-lg p-4 space-y-3 bg-blue-50">
              <p className="text-sm font-medium text-gray-700">Brochure</p>
              <div className="flex items-center gap-3 bg-white p-3 rounded border border-blue-100">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {supplierName} - {itemCode} Offer
                  </p>
                  <p className="text-xs text-gray-500">
                    {bidDetails.offerDocumentUrl.split('/').pop()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(bidDetails.offerDocumentUrl, '_blank')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View brochure
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleDownload(
                      bidDetails.offerDocumentUrl!,
                      `${itemCode}-${supplierName}-brochure.pdf`
                    )
                  }
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-gray-50 text-center">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No brochure available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

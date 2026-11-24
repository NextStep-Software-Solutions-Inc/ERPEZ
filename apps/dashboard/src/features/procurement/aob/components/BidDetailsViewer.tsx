/**
 * Bid Details Viewer Dialog
 * Displays complete bidding details for a specific supplier-item combination
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, CheckCircle, AlertCircle, Trophy, TrendingDown, Tag, Sparkles } from 'lucide-react'

interface BidDetailsViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemCode: string
  itemDescription: string
  itemABC: number
  unitABC?: number
  quantity?: number
  supplierName: string
  bidDetails: {
    unitBid: number | null
    totalBid: number | null
    brand?: string | null
    model?: string | null
    color?: string | null
    rank?: number | null
    score?: number | null
    qualityScore?: number
    calculatedQualityPriceRatio?: number
    remarks?: string | null
    offerDocumentUrl?: string | null
    brochureFileUrl?: string | null
    isWinner?: boolean
  }
}

export function BidDetailsViewer({
  open,
  onOpenChange,
  itemCode,
  itemDescription,
  itemABC,
  unitABC,
  quantity,
  supplierName,
  bidDetails,
}: BidDetailsViewerProps) {
  const exceedsABC = bidDetails.totalBid && itemABC > 0 && bidDetails.totalBid > itemABC
  const savings = bidDetails.totalBid && itemABC > 0 ? itemABC - bidDetails.totalBid : 0
  const savingsPercent = itemABC > 0 ? (savings / itemABC) * 100 : 0
  const isPositiveSavings = savings >= 0
  const brochureUrl = bidDetails.offerDocumentUrl || bidDetails.brochureFileUrl

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-xl">Bid Details - {supplierName}</DialogTitle>
            {bidDetails.isWinner && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1">
                <Trophy className="w-3 h-3" />
                Awarded Winner
              </Badge>
            )}
          </div>
          <DialogDescription className="text-sm text-gray-600">
            Item {itemCode} • {itemDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Item & ABC Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quantity && (
              <div className="border rounded-lg p-3 bg-gray-50">
                <p className="text-[11px] font-medium text-gray-500 uppercase">Quantity</p>
                <p className="text-lg font-bold text-gray-900">{quantity} units</p>
              </div>
            )}
            {unitABC && (
              <div className="border rounded-lg p-3 bg-gray-50">
                <p className="text-[11px] font-medium text-gray-500 uppercase">Unit ABC</p>
                <p className="text-lg font-bold text-gray-900">₱{unitABC.toLocaleString()}</p>
              </div>
            )}
            <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
              <p className="text-[11px] font-medium text-blue-800 uppercase">Approved ABC (Total)</p>
              <p className="text-lg font-bold text-blue-950">₱{itemABC.toLocaleString()}</p>
            </div>
            <div className="border rounded-lg p-3 bg-gray-50">
              <p className="text-[11px] font-medium text-gray-500 uppercase">Award Status</p>
              <p className="text-sm font-semibold mt-1">
                {bidDetails.isWinner ? (
                  <span className="text-amber-700 flex items-center gap-1 font-bold">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Awarded
                  </span>
                ) : (
                  <span className="text-gray-500">Not Awarded</span>
                )}
              </p>
            </div>
          </div>

          {/* Quoted Specifications (Brand, Model, Color) */}
          {(bidDetails.brand || bidDetails.model || bidDetails.color) && (
            <div className="border rounded-lg p-4 bg-slate-50 space-y-2 border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                Quoted Product Specifications
              </div>
              <div className="grid grid-cols-3 gap-4 pt-1">
                <div>
                  <p className="text-xs text-gray-500">Brand</p>
                  <p className="text-sm font-semibold text-gray-900">{bidDetails.brand || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Model / Series</p>
                  <p className="text-sm font-semibold text-gray-900">{bidDetails.model || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Color / Finish</p>
                  <p className="text-sm font-semibold text-gray-900">{bidDetails.color || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Pricing & Savings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="border rounded-lg p-4 bg-gray-50 space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase">Quoted Unit Price</p>
              <p className="text-xl font-bold text-gray-900">
                {bidDetails.unitBid ? `₱${bidDetails.unitBid.toLocaleString()}` : '-'}
              </p>
            </div>

            <div className={`border rounded-lg p-4 space-y-1 ${exceedsABC ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-600 uppercase">Total Bid Amount</p>
                {exceedsABC && (
                  <Badge variant="outline" className="text-[10px] bg-red-100 text-red-700 border-red-300">
                    Over ABC
                  </Badge>
                )}
              </div>
              <p className={`text-xl font-bold ${exceedsABC ? 'text-red-900' : 'text-green-900'}`}>
                {bidDetails.totalBid ? `₱${bidDetails.totalBid.toLocaleString()}` : '-'}
              </p>
            </div>

            <div className={`border rounded-lg p-4 space-y-1 ${isPositiveSavings ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <p className="text-xs font-medium text-gray-600 uppercase">
                {isPositiveSavings ? 'Budget Savings' : 'Budget Excess'}
              </p>
              <p className={`text-xl font-bold flex items-center gap-1 ${isPositiveSavings ? 'text-emerald-700' : 'text-red-700'}`}>
                {isPositiveSavings && <TrendingDown className="w-4 h-4" />}
                ₱{Math.abs(savings).toLocaleString()}
                <span className="text-xs font-normal">({savingsPercent.toFixed(1)}%)</span>
              </p>
            </div>
          </div>

          {/* Evaluation & Scoring */}
          {(bidDetails.rank != null || bidDetails.score != null || bidDetails.qualityScore != null) && (
            <div className="border rounded-lg p-4 space-y-3 bg-purple-50/70 border-purple-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-900 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                BAC Evaluation & Ranking
              </div>
              <div className="grid grid-cols-3 gap-4">
                {bidDetails.rank != null && bidDetails.rank > 0 && (
                  <div>
                    <p className="text-xs text-gray-600">Calculated Rank</p>
                    <Badge variant="outline" className="text-xs font-bold text-emerald-800 bg-emerald-50 border-emerald-300 mt-1">
                      Rank {bidDetails.rank}
                    </Badge>
                  </div>
                )}
                {bidDetails.score != null && (
                  <div>
                    <p className="text-xs text-gray-600">Price / Total Score</p>
                    <p className="text-lg font-bold text-purple-950">{bidDetails.score}%</p>
                  </div>
                )}
                {bidDetails.qualityScore != null && (
                  <div>
                    <p className="text-xs text-gray-600">Technical / Quality Score</p>
                    <p className="text-lg font-bold text-purple-950">{bidDetails.qualityScore}/100</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Remarks */}
          {bidDetails.remarks && (
            <div className="border rounded-lg p-4 space-y-1 bg-gray-50">
              <p className="text-xs font-semibold text-gray-600 uppercase">Remarks / Award Justification</p>
              <p className="text-sm text-gray-700">{bidDetails.remarks}</p>
            </div>
          )}

          {/* Brochure & Catalog Attachment */}
          {brochureUrl ? (
            <div className="border rounded-lg p-4 space-y-3 bg-blue-50/60 border-blue-200">
              <p className="text-xs font-semibold text-blue-900 uppercase">Technical Specifications & Brochure</p>
              <div className="flex items-center gap-3 bg-white p-3 rounded border border-blue-100">
                <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {supplierName} - {itemCode} Technical Brochure
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {brochureUrl.split('/').pop()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1"
                    onClick={() => window.open(brochureUrl, '_blank')}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1"
                    onClick={() => handleDownload(brochureUrl, `${itemCode}-${supplierName}-brochure.pdf`)}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-gray-50 text-center text-xs text-gray-500">
              <FileText className="w-5 h-5 text-gray-400 mx-auto mb-1" />
              No electronic brochure attached for this quotation
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

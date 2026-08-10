/**
 * Bid Details Dialog
 * Modal for viewing comprehensive bid information
 * Shows supplier details, bid amounts, quality scores, ABC comparison, and remarks
 */

import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, TrendingDown } from 'lucide-react'
import type { SupplierBid, LineItem } from '../types/aobTypes'

interface BidDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bid: SupplierBid | null
  lineItem: LineItem | null
  isWinner?: boolean
}

function formatCurrency(amount: number | null | undefined): string {
  if (!amount) return '-'
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatPercentage(value: number | null | undefined): string {
  if (!value && value !== 0) return '-'
  return `${value.toFixed(2)}%`
}

export function BidDetailsDialog({
  open,
  onOpenChange,
  bid,
  lineItem,
  isWinner = false,
}: BidDetailsDialogProps) {
  if (!bid || !lineItem) return null

  const isResponsive = bid.unitBid != null
  const exceedsABC = lineItem.approvedBudgetForContract && bid.totalBid && bid.totalBid > lineItem.approvedBudgetForContract
  const savings = lineItem.approvedBudgetForContract && bid.totalBid ? lineItem.approvedBudgetForContract - bid.totalBid : null

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Bid Details"
      description={`Comprehensive bid information for ${bid.supplierName}`}
      size="lg"
      showCloseButton
    >
      <div className="space-y-6 py-2">
        {/* Winner Badge */}
        {isWinner && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 text-sm">
              This supplier is currently selected as the winner for this line item
            </AlertDescription>
          </Alert>
        )}

        {/* Non-Responsive Alert */}
        {!isResponsive && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">
              This bid is non-responsive (no unit bid submitted)
            </AlertDescription>
          </Alert>
        )}

        {/* Exceeds ABC Alert */}
        {exceedsABC && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 text-sm">
              Total bid exceeds the Approved Budget for Contract (ABC)
            </AlertDescription>
          </Alert>
        )}

        {/* Supplier Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-gray-900">Supplier Information</h3>
          <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded border">
            <div>
              <span className="text-xs font-semibold text-gray-600 uppercase">Supplier Name</span>
              <p className="font-medium text-sm mt-1">{bid.supplierName}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-600 uppercase">Submission Status</span>
              <p className="text-sm mt-1">
                <Badge variant={isResponsive ? 'soft' : 'outline'} className={isResponsive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {isResponsive ? 'Responsive' : 'Non-Responsive'}
                </Badge>
              </p>
            </div>
          </div>
        </div>

        {/* Line Item Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-gray-900">Line Item Details</h3>
          <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded border">
            <div>
              <span className="text-xs font-semibold text-gray-600 uppercase">Item Code</span>
              <p className="font-medium text-sm mt-1">{lineItem.itemCode}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-600 uppercase">Quantity</span>
              <p className="text-sm mt-1">{lineItem.quantity} {lineItem.unit}</p>
            </div>
            <div className="col-span-2">
              <span className="text-xs font-semibold text-gray-600 uppercase">Description</span>
              <p className="text-sm mt-1 text-gray-700">{lineItem.description}</p>
            </div>
          </div>
        </div>

        {/* Bid Pricing Information */}
        {isResponsive && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">Bid Pricing</h3>
            <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded border border-blue-200">
              <div>
                <span className="text-xs font-semibold text-gray-600 uppercase">Unit Price</span>
                <p className="font-semibold text-lg mt-1 text-blue-900">{formatCurrency(bid.unitBid)}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-600 uppercase">Total Bid Amount</span>
                <p className="font-semibold text-lg mt-1 text-blue-900">{formatCurrency(bid.totalBid)}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-600 uppercase">ABC (Budget)</span>
                <p className={`font-semibold text-lg mt-1 ${exceedsABC ? 'text-red-900' : 'text-green-900'}`}>
                  {formatCurrency(lineItem.approvedBudgetForContract)}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-600 uppercase">
                  {savings && savings > 0 ? 'Savings' : 'Excess'}
                </span>
                <p className={`font-semibold text-lg mt-1 flex items-center gap-1 ${savings && savings > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  <TrendingDown className="w-4 h-4" />
                  {formatCurrency(savings)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quality & Evaluation Scores */}
        {(bid.qualityScore != null || bid.calculatedQualityPriceRatio != null) && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">Quality & Evaluation</h3>
            <div className="grid grid-cols-2 gap-4 p-3 bg-purple-50 rounded border border-purple-200">
              {bid.qualityScore != null && (
                <div>
                  <span className="text-xs font-semibold text-gray-600 uppercase">Quality Score</span>
                  <p className="font-semibold text-lg mt-1 text-purple-900">{bid.qualityScore}/100</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${bid.qualityScore}%` }}
                    />
                  </div>
                </div>
              )}
              {bid.calculatedQualityPriceRatio != null && (
                <div>
                  <span className="text-xs font-semibold text-gray-600 uppercase">Quality-Price Ratio</span>
                  <p className="font-semibold text-lg mt-1 text-purple-900">
                    {bid.calculatedQualityPriceRatio.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Higher is better</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Remarks */}
        {bid.remarks && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">Remarks & Notes</h3>
            <div className="p-3 bg-gray-50 rounded border">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{bid.remarks}</p>
            </div>
          </div>
        )}

        {/* Compliance Summary */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-gray-900">Compliance Summary</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Responsive Bid</span>
              <Badge variant={isResponsive ? 'soft' : 'outline'} className={isResponsive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {isResponsive ? '✓ Yes' : '✗ No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Within ABC</span>
              <Badge variant={!exceedsABC ? 'soft' : 'outline'} className={!exceedsABC ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {!exceedsABC ? '✓ Yes' : '✗ No'}
              </Badge>
            </div>
            {bid.qualityScore != null && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">Quality Score</span>
                <Badge variant="soft" className="bg-blue-100 text-blue-800">
                  {bid.qualityScore}/100
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </ResponsiveDialog>
  )
}

/**
 * Select Winner Dialog
 * OrdinaryDialog (ResponsiveDialog) for selecting winning suppliers per line item
 * Allows BAC to evaluate bids side-by-side and confirm winners before proceeding to approval
 */

import { useState, useMemo } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Trophy, CheckCircle, AlertCircle, Eye } from 'lucide-react'
import type { BidMatrix, LineItem, SupplierBid } from '../types/aobTypes'
import { BidDetailsDialog } from './BidDetailsDialog'

interface SelectWinnerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bidMatrix: BidMatrix
  onConfirm: (selections: Record<string, string>) => void
}

function formatCurrency(amount: number | null | undefined): string {
  if (!amount) return '-'
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function getLowestBidId(bids: SupplierBid[]): string | null {
  const responsive = bids.filter((b) => b.unitBid != null)
  if (!responsive.length) return null
  return responsive.reduce((a, b) => (b.unitBid! < a.unitBid! ? b : a)).supplierId
}

interface LineItemRowProps {
  item: LineItem
  selectedId: string | null
  onSelect: (supplierId: string) => void
  onViewDetails: (bid: SupplierBid) => void
}

function LineItemRow({ item, selectedId, onSelect, onViewDetails }: LineItemRowProps) {
  const bids = item.lineItems ?? []
  const responsiveBids = bids.filter((b) => b.unitBid != null)
  const lowestBidId = useMemo(() => getLowestBidId(responsiveBids), [responsiveBids])

  return (
    <div className="space-y-3">
      {/* Item Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="font-semibold text-sm">{item.itemCode}</span>
          <span className="text-gray-600 text-sm ml-2">{item.description}</span>
          <div className="text-xs text-gray-500 mt-0.5">
            Qty: {item.quantity} {item.unit} • ABC:{' '}
            {formatCurrency(item.approvedBudgetForContract)}
          </div>
        </div>
        {selectedId && (
          <Badge variant="soft" className="flex items-center gap-1 shrink-0 ml-2">
            <CheckCircle className="w-3 h-3" />
            Winner Set
          </Badge>
        )}
      </div>

      {/* Bid Options */}
      {responsiveBids.length === 0 ? (
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded border">
          No responsive bids for this item
        </div>
      ) : (
        <div className="grid gap-2">
          {responsiveBids.map((bid) => {
            const isSelected = bid.supplierId === selectedId
            const isLowest = bid.supplierId === lowestBidId
            return (
              <button
                key={bid.supplierId}
                type="button"
                onClick={() => onSelect(bid.supplierId)}
                className={`w-full text-left rounded-lg border p-3 transition-colors ${
                  isSelected
                    ? 'border-yellow-400 bg-yellow-50 ring-1 ring-yellow-400'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {isSelected ? (
                      <Trophy className="w-4 h-4 text-yellow-600 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                    )}
                    <span className="font-medium text-sm truncate">{bid.supplierName}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isLowest && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Lowest
                      </Badge>
                    )}
                    {bid.calculatedQualityPriceRatio != null && (
                      <Badge variant="outline" className="text-xs">
                        Score: {bid.calculatedQualityPriceRatio.toFixed(2)}
                      </Badge>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewDetails(bid)
                      }}
                      className="h-7 w-7 p-0"
                      title="View bid details"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 ml-6 flex items-center gap-4 text-xs text-gray-600">
                  <span>Unit: {formatCurrency(bid.unitBid)}</span>
                  <span>Total: {formatCurrency(bid.totalBid)}</span>
                  {bid.qualityScore != null && (
                    <span>Quality: {bid.qualityScore}/100</span>
                  )}
                </div>
                {bid.remarks && (
                  <div className="mt-1 ml-6 text-xs text-gray-400 italic truncate">
                    {bid.remarks}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function SelectWinnerDialog({
  open,
  onOpenChange,
  bidMatrix,
  onConfirm,
}: SelectWinnerDialogProps) {
  const lineItems = bidMatrix.lineItems ?? []
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [selectedBidDetails, setSelectedBidDetails] = useState<{bid: SupplierBid; lineItem: LineItem} | null>(null)

  // Initialize selections from existing winners
  const initialSelections = useMemo(() => {
    const initial: Record<string, string> = {}
    lineItems.forEach((item) => {
      if (item.selectedWinnerId) initial[item.id] = item.selectedWinnerId
    })
    return initial
  }, [lineItems])

  const [selections, setSelections] = useState<Record<string, string>>(initialSelections)

  const selectedCount = Object.keys(selections).length
  const totalItems = lineItems.length
  const allSelected = selectedCount === totalItems

  // Check if there are unsaved changes
  const hasUnsavedChanges = JSON.stringify(selections) !== JSON.stringify(initialSelections)

  const handleSelect = (lineItemId: string, supplierId: string) => {
    setSelections((prev) => ({ ...prev, [lineItemId]: supplierId }))
  }

  const handleViewDetails = (bid: SupplierBid) => {
    const lineItem = lineItems.find((item) => item.lineItems?.some((b) => b.supplierId === bid.supplierId))
    if (lineItem) {
      setSelectedBidDetails({ bid, lineItem })
    }
  }

  const handleConfirm = () => {
    onConfirm(selections)
    onOpenChange(false)
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true)
    } else {
      onOpenChange(false)
    }
  }

  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false)
    setSelections(initialSelections)
    onOpenChange(false)
  }

  return (
    <>
      <ResponsiveDialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) {
            onOpenChange(true)
            return
          }

          handleClose()
        }}
        title="Select Winners"
        description={`Choose the winning supplier for each line item (${selectedCount}/${totalItems} selected)`}
        size="lg"
        showCloseButton
        footer={
          <div className="flex items-center justify-between w-full gap-3">
            <div className="text-sm text-gray-500">
              {allSelected ? (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  All items have a winner selected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  {totalItems - selectedCount} item{totalItems - selectedCount !== 1 ? 's' : ''} pending
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={selectedCount === 0}
                className="gap-2"
              >
                <Trophy className="w-4 h-4" />
                Confirm Winners
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-5 py-2">
          {!allSelected && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                Select a winner for every line item before you can approve the AOB.
              </AlertDescription>
            </Alert>
          )}

          {lineItems.map((item, idx) => (
            <div key={item.id}>
              <LineItemRow
                item={item}
                selectedId={selections[item.id] ?? null}
                onSelect={(supplierId) => handleSelect(item.id, supplierId)}
                onViewDetails={handleViewDetails}
              />
              {idx < lineItems.length - 1 && <Separator className="mt-5" />}
            </div>
          ))}
        </div>
      </ResponsiveDialog>

      {/* Unsaved Changes Confirmation Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes to winner selections. Do you want to discard these changes and close?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowUnsavedDialog(false)}>
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardChanges}
              className="bg-red-600 hover:bg-red-700"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bid Details Dialog */}
      <BidDetailsDialog
        open={selectedBidDetails != null}
        onOpenChange={(open) => {
          if (!open) setSelectedBidDetails(null)
        }}
        bid={selectedBidDetails?.bid ?? null}
        lineItem={selectedBidDetails?.lineItem ?? null}
        isWinner={selectedBidDetails ? selectedBidDetails.lineItem.selectedWinnerId === selectedBidDetails.bid.supplierId : false}
      />
    </>
  )
}

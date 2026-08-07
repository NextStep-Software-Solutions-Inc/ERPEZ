/**
 * Winner Selection Component
 * Dropdown for selecting winning supplier for a line item
 * Displays award criteria scores to aid decision
 */

import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Trophy, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { SupplierBid, LineItem } from '../types/aobTypes'

interface WinnerSelectionProps {
  lineItem: LineItem
  bids: SupplierBid[]
  currentWinnerId?: string | null
  onSelectWinner: (supplierId: string, lineItemId: string) => void
  onClearWinner?: (lineItemId: string) => void
  readOnly?: boolean
}

/**
 * Get award criteria badge color
 */
function getAwardBadgeColor(ratio: number | undefined): string {
  if (!ratio) return 'bg-gray-100'
  if (ratio >= 0.8) return 'bg-green-100 text-green-800'
  if (ratio >= 0.6) return 'bg-yellow-100 text-yellow-800'
  return 'bg-orange-100 text-orange-800'
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number | undefined | null): string {
  if (!amount) return '-'
  return `₱${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

export function WinnerSelection({
  lineItem,
  bids,
  currentWinnerId,
  onSelectWinner,
  onClearWinner,
  readOnly = false,
}: WinnerSelectionProps) {
  const currentWinner = bids.find((bid) => bid.supplierId === currentWinnerId)
  const normalizedAwardCriterion =
    typeof lineItem.awardCriterion === 'string' ? lineItem.awardCriterion.trim().toLowerCase() : ''
  const isLcrbAwardCriterion =
    normalizedAwardCriterion === 'lcrb' ||
    normalizedAwardCriterion.includes('lowest calculated and responsive bid')
  const responsiveBids = bids.filter((bid) => {
    const hasUnitBid = bid.unitBid !== undefined && bid.unitBid !== null
    const hasQualityScore = bid.qualityScore !== undefined && bid.qualityScore !== null

    return hasUnitBid && (isLcrbAwardCriterion || hasQualityScore)
  })
  const handleSelectWinner = useCallback(
    (supplierId: string) => {
      onSelectWinner(supplierId, lineItem.id)
    },
    [onSelectWinner, lineItem.id]
  )

  const handleClearWinner = useCallback(() => {
    onClearWinner?.(lineItem.id)
  }, [onClearWinner, lineItem.id])

  return (
    <div className="space-y-3">
      {/* Selected Winner Display */}
      {currentWinner && (
        <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded border border-yellow-200">
          <Trophy className="w-4 h-4 text-yellow-600" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{currentWinner.supplierName}</div>
            <div className="text-xs text-gray-600">
              {formatCurrency(currentWinner.unitBid)} per unit • Total:{' '}
              {formatCurrency(currentWinner.totalBid)}
            </div>
          </div>
          {!readOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearWinner}
              className="text-xs"
            >
              Clear
            </Button>
          )}
        </div>
      )}

      {/* Winner Selection Dropdown */}
      {!readOnly && responsiveBids.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between"
            >
              <span>{currentWinner ? 'Change Winner' : 'Select Winner'}</span>
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80">
            <DropdownMenuLabel>
              <div className="text-xs">
                {lineItem.itemCode} - {lineItem.description}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {responsiveBids.length === 0 ? (
              <DropdownMenuItem disabled>
                <span className="text-xs text-gray-600">No bids available</span>
              </DropdownMenuItem>
            ) : (
              responsiveBids.map((bid) => (
                <DropdownMenuCheckboxItem
                  key={bid.supplierId}
                  checked={bid.supplierId === currentWinnerId}
                  onCheckedChange={() => handleSelectWinner(bid.supplierId)}
                  className="flex flex-col gap-2 py-3"
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="font-medium text-sm">{bid.supplierName}</span>
                    {bid.calculatedQualityPriceRatio && (
                      <Badge variant="outline" className={getAwardBadgeColor(bid.calculatedQualityPriceRatio)}>
                        {bid.calculatedQualityPriceRatio.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs text-gray-600">
                    <span>Unit: {formatCurrency(bid.unitBid)}</span>
                    <span>Total: {formatCurrency(bid.totalBid)}</span>
                  </div>
                  {bid.qualityScore && (
                    <div className="text-xs text-gray-500">
                      Quality Score: {bid.qualityScore}/100
                    </div>
                  )}
                  {bid.remarks && (
                    <div className="text-xs text-gray-500 italic truncate">
                      {bid.remarks}
                    </div>
                  )}
                </DropdownMenuCheckboxItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* No Bids Message */}
      {responsiveBids.length === 0 && (
        <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
          No responsive bids available for this item
        </div>
      )}
    </div>
  )
}

import React from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, Lock, TrendingDown, FileText } from 'lucide-react'
import type { Supplier, LineItem, SupplierBid } from '../types/aobTypes'

interface BidMatrixSupplierRowProps {
  supplier: Supplier
  paginatedItems: LineItem[]
  groupedBids: Record<string, SupplierBid[]>
  isBidsOpened: boolean
  awardCriterion?: string
  totalData: { total: number; wonCount: number; awardedTotal: number }
  isLowestTotal: boolean
  isFullPackageWinner: boolean
  lineItemsCount: number
  suppliersCount: number
  formatPHP: (amount: number | null | undefined) => string
  onViewBidDetails: (supplier: Supplier, item: LineItem, bid: SupplierBid) => void
  onPreviewSubmittedRFQ?: (supplier: Supplier) => void
}

export function BidMatrixSupplierRow({
  supplier,
  paginatedItems,
  groupedBids,
  isBidsOpened,
  awardCriterion = 'LCRB',
  totalData,
  isLowestTotal,
  isFullPackageWinner,
  lineItemsCount,
  suppliersCount,
  formatPHP,
  onViewBidDetails,
  onPreviewSubmittedRFQ,
}: BidMatrixSupplierRowProps) {
  const supplierName = supplier.supplierName || supplier.name || 'Supplier'
  const isWinnerRow = totalData.wonCount > 0
  const supplierBids = groupedBids[supplier.id] || []
  const hasSubmitted =
    supplier.hasSubmitted !== false &&
    (Boolean(supplier.submittedAt) || Boolean(supplier.submissionType) || supplierBids.length > 0)

  return (
    <TableRow
      className="bg-card hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors border-b"
    >
      {/* 1. Sticky Supplier Cell (Center-aligned, white body matching Award Summary) */}
      <TableCell
        className="sticky left-0 z-20 border-r text-center align-middle py-3 px-3 shadow-xs bg-card"
      >
        <div className="flex flex-col items-center justify-center gap-1.5 min-w-[180px] max-w-[240px] mx-auto text-center">
          <div className="flex items-center justify-center gap-1.5">
            {isFullPackageWinner && (
              <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
            )}
            <span
              className="font-bold text-xs text-foreground leading-tight text-center"
              title={supplierName}
            >
              {supplierName}
            </span>
          </div>

          {!hasSubmitted ? (
            <Badge
              variant="outline"
              className="text-[10px] py-0.5 px-2 font-normal text-muted-foreground border-slate-300 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800/80 rounded-full"
            >
              Did Not Submit
            </Badge>
          ) : (
            <>
              {isFullPackageWinner ? (
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 leading-none">
                  Lowest Calculated Responsive Bid
                </span>
              ) : supplier.submissionType ? (
                <Badge
                  variant="outline"
                  className="text-[10px] py-0 px-2 font-normal text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/40 rounded-full"
                >
                  {supplier.submissionType}
                </Badge>
              ) : null}

              {onPreviewSubmittedRFQ && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onPreviewSubmittedRFQ(supplier)}
                  className="h-6 px-2 text-[10px] font-medium text-primary hover:text-primary/90 hover:bg-primary/10 gap-1 rounded-sm cursor-pointer"
                  title={`Preview submitted RFQ for ${supplierName}`}
                >
                  <FileText className="w-3 h-3" />
                  Preview RFQ
                </Button>
              )}
            </>
          )}
        </div>
      </TableCell>

      {/* 2. Line Item Bid Cells */}
      {paginatedItems.map((item) => {
        const bid = groupedBids[supplier.id]?.find(
          (b) => b.lineItemId === item.id || b.rfqItemId === item.id
        )
        const abcUnitPrice = item.abcUnitPrice || item.approvedBudgetForContract || 0
        const itemQuantity = item.quantity || 1
        const totalABC = item.totalABC || (abcUnitPrice * itemQuantity)
        const totalBid = bid?.totalBid || (bid?.unitBid ? bid.unitBid * itemQuantity : 0)

        const exceedsABC = Boolean(
          bid?.isOverABC ||
          (bid?.unitBid && abcUnitPrice > 0 && bid.unitBid > abcUnitPrice) ||
          (totalBid > 0 && totalABC > 0 && totalBid > totalABC)
        )

        const hasSavings = !exceedsABC && totalABC > 0 && totalBid > 0 && totalBid < totalABC
        const savingsAmount = hasSavings ? totalABC - totalBid : 0
        const savingsPercent = hasSavings && totalABC > 0 ? (savingsAmount / totalABC) * 100 : 0

        return (
          <React.Fragment key={`${supplier.id}-${item.id}`}>
            {/* Unit Bid Cell */}
            <TableCell className="text-center align-middle border-l py-2.5 px-2">
              {!isBidsOpened ? (
                <span className="text-xs text-muted-foreground italic inline-flex items-center gap-1">
                  <Lock className="w-3 h-3" aria-hidden="true" /> Sealed
                </span>
              ) : bid?.unitBid ? (
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="font-bold text-xs text-foreground">
                    {formatPHP(bid.unitBid)}
                  </span>
                  {bid.rank === 1 && !exceedsABC && (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] py-0 px-2 font-bold shadow-xs rounded-full whitespace-nowrap">
                      #1 - {awardCriterion}
                    </Badge>
                  )}
                  {bid.rank != null && bid.rank > 1 && !exceedsABC && (
                    <Badge
                      variant="outline"
                      className="text-[10px] py-0 px-2 font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded-full whitespace-nowrap"
                    >
                      #{bid.rank} {bid.score != null ? `(${bid.score}%)` : ''}
                    </Badge>
                  )}
                  {exceedsABC && (
                    <Badge
                      variant="outline"
                      className="text-[10px] py-0 px-2 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800 rounded-full whitespace-nowrap"
                    >
                      Disqualified
                    </Badge>
                  )}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">-</span>
              )}
            </TableCell>

            {/* Total Bid Cell */}
            <TableCell className="text-center align-middle border-r py-2.5 px-2">
              {!isBidsOpened ? (
                <span className="text-xs text-muted-foreground italic">Sealed</span>
              ) : bid?.totalBid ? (
                <button
                  type="button"
                  onClick={() => onViewBidDetails(supplier, item, bid)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onViewBidDetails(supplier, item, bid)
                    }
                  }}
                  className="w-full cursor-pointer flex flex-col items-center justify-center gap-1 p-1 rounded hover:bg-muted/60 transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary/50"
                  aria-label={`View quotation details for ${item.description || item.name} by ${supplierName}`}
                >
                  <span className="font-bold text-xs text-foreground">
                    {formatPHP(bid.totalBid)}
                  </span>
                  {exceedsABC ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] py-0 px-2 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800 rounded-full whitespace-nowrap"
                    >
                      Over ABC
                    </Badge>
                  ) : savingsAmount > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                      <TrendingDown className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
                      <span>~ +{formatPHP(savingsAmount)} ({savingsPercent.toFixed(1)}% saved)</span>
                    </span>
                  ) : null}
                </button>
              ) : (
                <span className="text-xs text-muted-foreground">-</span>
              )}
            </TableCell>
          </React.Fragment>
        )
      })}

      {/* 3. Overall Total Quotation Column */}
      <TableCell className="text-center align-middle border-x py-2.5 px-3 font-medium">
        {!isBidsOpened ? (
          <span className="text-xs text-muted-foreground italic">Sealed</span>
        ) : totalData.total > 0 ? (
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="font-bold text-xs text-foreground">
              {formatPHP(totalData.total)}
            </span>
            {isLowestTotal && suppliersCount > 1 && (
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                Lowest Quoted Package
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </TableCell>

      {/* 4. Award Status Column (Amber Tinted Background with Gold Badge) */}
      <TableCell className="text-center align-middle py-2.5 px-3 bg-amber-50/40 dark:bg-amber-950/20 border-l">
        {totalData.wonCount > 0 ? (
          <div className="flex flex-col items-center justify-center gap-1">
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1 text-[11px] py-0.5 px-2.5 font-bold shadow-xs rounded-full inline-flex items-center">
              <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
              Winner ({totalData.wonCount}{lineItemsCount > 0 ? `/${lineItemsCount}` : ''})
            </Badge>
            {totalData.awardedTotal > 0 && (
              <span className="font-bold text-xs text-amber-900 dark:text-amber-300">
                {formatPHP(totalData.awardedTotal)}
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </TableCell>
    </TableRow>
  )
}

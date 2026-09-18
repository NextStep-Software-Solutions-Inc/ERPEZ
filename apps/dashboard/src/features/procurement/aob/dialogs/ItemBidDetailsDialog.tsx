import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Badge } from '@/components/ui/badge'
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trophy, CheckCircle, AlertCircle, TrendingDown, Building2, Package } from 'lucide-react'
import type { SupplierBid, LineItem } from '../types/aobTypes'

export interface ItemSummaryData {
  itemId: string
  rfqItemId?: string
  itemCode: string
  description: string
  itemName?: string
  quantity: number
  unit: string
  abc: number
  abcUnitPrice?: number
  winnerSupplier?: string
  winnerSupplierId?: string
  winnerBid?: SupplierBid
  secondPlace?: SupplierBid
  totalBids: number
  responsiveBids: number
  savingsAmount: number
  savingsPercentage: number
  rawItem: LineItem
  allBids: SupplierBid[]
}

interface ItemBidDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ItemSummaryData | null
}

function formatPHP(amount: number | null | undefined): string {
  if (amount == null) return '-'
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function ItemBidDetailsDialog({
  open,
  onOpenChange,
  item,
}: ItemBidDetailsDialogProps) {
  if (!item) return null

  const unitABC = item.quantity > 0 ? item.abc / item.quantity : item.abc
  const sortedBids = [...item.allBids].sort((a, b) => {
    // Responsive bids first, then by rank or unit price
    if (a.isResponsive && !b.isResponsive) return -1
    if (!a.isResponsive && b.isResponsive) return 1
    const priceA = a.unitBid ?? a.unitPrice ?? Infinity
    const priceB = b.unitBid ?? b.unitPrice ?? Infinity
    return priceA - priceB
  })

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Item Bid Details — ${item.itemCode}`}
      description={item.description || item.itemName || 'Comprehensive evaluation of submitted quotations for this item'}
      size="xl"
      showCloseButton
    >
      <div className="space-y-6 py-2">
        {/* Item Specification & Budget Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg border">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Item Name / Code</span>
            <p className="font-bold text-sm text-gray-900 dark:text-gray-100 mt-0.5">{item.itemCode}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{item.description}</p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Required Quantity</span>
            <p className="font-bold text-sm text-gray-900 dark:text-gray-100 mt-0.5">
              {item.quantity} {item.unit || 'unit'}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">ABC Unit Price</span>
            <p className="font-bold text-sm text-gray-900 dark:text-gray-100 mt-0.5">{formatPHP(unitABC)}</p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total ABC Budget</span>
            <p className="font-bold text-sm text-blue-600 dark:text-blue-400 mt-0.5">{formatPHP(item.abc)}</p>
          </div>
        </div>

        {/* Current Award Status Banner */}
        {item.winnerSupplier ? (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    Awarded Winner
                  </span>
                  <Badge variant="soft" className="bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100 text-[10px]">
                    LCRB
                  </Badge>
                </div>
                <div className="font-bold text-base text-gray-900 dark:text-white">
                  {item.winnerSupplier}
                </div>
                {item.winnerBid?.winningReason && (
                  <p className="text-xs text-emerald-800 dark:text-emerald-400 mt-0.5">
                    Reason: {item.winnerBid.winningReason}
                  </p>
                )}
              </div>
            </div>
            <div className="text-left md:text-right border-t md:border-t-0 pt-2 md:pt-0">
              <div className="text-xs text-gray-600 dark:text-gray-400">Awarded Total</div>
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                {formatPHP(item.winnerBid?.totalBid || (item.winnerBid?.unitBid ? item.winnerBid.unitBid * item.quantity : 0))}
              </div>
              {item.savingsAmount > 0 && (
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center md:justify-end gap-1 mt-0.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Savings: {formatPHP(item.savingsAmount)} ({item.savingsPercentage.toFixed(1)}%)</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">No Winning Bidder Selected</p>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Select a responsive bidder in the Bid Evaluation Matrix to complete the award for this item.
              </p>
            </div>
          </div>
        )}

        {/* All Submitted Quotations Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              Submitted Quotations ({sortedBids.length})
            </h4>
            <span className="text-xs text-muted-foreground">
              Sorted by evaluated rank & price
            </span>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <UITable>
              <TableHeader>
                <TableRow className="bg-gray-50/80 dark:bg-gray-900/50">
                  <TableHead className="w-16 text-center text-xs font-semibold">Rank</TableHead>
                  <TableHead className="text-xs font-semibold">Supplier</TableHead>
                  <TableHead className="text-xs font-semibold">Brand / Model</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Unit Quotation</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Total Quotation</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Savings vs ABC</TableHead>
                  <TableHead className="text-center text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-center text-xs font-semibold">Award</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedBids.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-sm text-muted-foreground">
                      No bids submitted for this item yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedBids.map((b, idx) => {
                    const unitPrice = b.unitBid ?? b.unitPrice ?? 0
                    const totalBid = b.totalBid ?? (unitPrice * item.quantity)
                    const isWinner = item.winnerSupplierId === b.supplierId || item.winnerSupplier === b.supplierName || b.isWinner
                    const bidSavings = item.abc - totalBid
                    const bidSavingsPct = item.abc > 0 ? (bidSavings / item.abc) * 100 : 0
                    const isOver = b.isOverABC || totalBid > item.abc

                    return (
                      <TableRow key={b.id || idx} className={isWinner ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''}>
                        {/* Rank */}
                        <TableCell className="text-center">
                          {b.rank === 1 && !isOver && b.isResponsive ? (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                              #1 LCRB
                            </span>
                          ) : b.rank ? (
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              #{b.rank}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </TableCell>

                        {/* Supplier */}
                        <TableCell>
                          <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                            {b.supplierName}
                          </div>
                          {b.qualityScore != null && (
                            <div className="text-[11px] text-gray-500">
                              Quality Score: {b.qualityScore}/100
                            </div>
                          )}
                        </TableCell>

                        {/* Brand / Model */}
                        <TableCell>
                          <div className="text-xs text-gray-700 dark:text-gray-300">
                            {b.brand || b.model ? `${b.brand || ''} ${b.model || ''}`.trim() : '-'}
                          </div>
                          {b.color && <div className="text-[11px] text-gray-500">Color: {b.color}</div>}
                        </TableCell>

                        {/* Unit Quotation */}
                        <TableCell className="text-right font-medium text-sm">
                          {unitPrice > 0 ? formatPHP(unitPrice) : '-'}
                        </TableCell>

                        {/* Total Quotation */}
                        <TableCell className="text-right font-bold text-sm">
                          <span className={isOver ? 'text-red-600' : 'text-gray-900 dark:text-white'}>
                            {totalBid > 0 ? formatPHP(totalBid) : '-'}
                          </span>
                        </TableCell>

                        {/* Savings vs ABC */}
                        <TableCell className="text-right">
                          {totalBid > 0 ? (
                            bidSavings >= 0 ? (
                              <div>
                                <span className="font-semibold text-xs text-emerald-600">
                                  +{formatPHP(bidSavings)}
                                </span>
                                <div className="text-[10px] text-emerald-700 font-medium">
                                  ({bidSavingsPct.toFixed(1)}% savings)
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="font-semibold text-xs text-red-600">
                                  -{formatPHP(Math.abs(bidSavings))}
                                </span>
                                <div className="text-[10px] text-red-600 font-medium">
                                  ({Math.abs(bidSavingsPct).toFixed(1)}% over ABC)
                                </div>
                              </div>
                            )
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </TableCell>

                        {/* Evaluation Status */}
                        <TableCell className="text-center">
                          {isOver ? (
                            <Badge variant="soft" className="bg-red-100 text-red-800 text-[10px]">
                              Over ABC
                            </Badge>
                          ) : !b.isResponsive ? (
                            <Badge variant="soft" className="bg-rose-100 text-rose-800 text-[10px]" title={b.disqualificationReason || 'Non-responsive'}>
                              Failed
                            </Badge>
                          ) : (
                            <Badge variant="soft" className="bg-green-100 text-green-800 text-[10px]">
                              Responsive
                            </Badge>
                          )}
                        </TableCell>

                        {/* Award Status */}
                        <TableCell className="text-center">
                          {isWinner ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-yellow-100 text-yellow-900 border border-yellow-300">
                              <Trophy className="w-3 h-3 text-yellow-600" />
                              Winner
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </UITable>
          </div>
        </div>
      </div>
    </ResponsiveDialog>
  )
}

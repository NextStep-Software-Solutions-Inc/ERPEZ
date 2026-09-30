/**
 * Item Bid Details Table Component
 * Summary view of winning bids for each line item
 * Shows final award decisions, savings analysis, and bid details inspection
 */

import { useState, useMemo } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, AlertCircle, TrendingDown, Eye } from 'lucide-react'
import type { SupplierBid, LineItem, AOB } from '../types/aobTypes'
import { ItemBidDetailsDialog, type ItemSummaryData } from '../dialogs/ItemBidDetailsDialog'

interface ItemBidDetailsTableProps {
  lineItems: LineItem[]
  bids?: SupplierBid[]
  aob?: AOB
  variant?: 'compact' | 'detailed'
  onSelectWinners?: () => void
  isApproved?: boolean
}

export type ItemSummary = ItemSummaryData

const columnHelper = createColumnHelper<ItemSummary>()

function formatPHP(amount: number | null | undefined): string {
  if (amount == null) return '-'
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Create column definitions for item bid summary
 */
function createItemBidColumns(
  variant: 'compact' | 'detailed' = 'detailed',
  onViewItemDetails?: (item: ItemSummary) => void
): ColumnDef<ItemSummary>[] {
  const columns = []

  if (variant === 'compact') {
    columns.push(
      columnHelper.accessor('itemCode', {
        header: 'Item Code',
        size: 100,
        cell: (info) => <span className="font-semibold text-sm">{info.getValue() as string}</span>,
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        size: 250,
        cell: (info) => (
          <div className="text-sm line-clamp-2">{info.getValue() as string}</div>
        ),
      }),
      columnHelper.display({
        id: 'winner',
        header: 'Winner',
        size: 150,
        cell: (info) => {
          const item = info.row.original
          return item.winnerSupplier ? (
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <span className="text-sm font-medium">{item.winnerSupplier}</span>
            </div>
          ) : (
            <span className="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded">
              Not Awarded
            </span>
          )
        },
      }),
      columnHelper.display({
        id: 'totalBid',
        header: 'Award Price',
        size: 130,
        cell: (info) => {
          const item = info.row.original
          const price = item.winnerBid?.totalBid ?? (item.winnerBid?.unitBid ? item.winnerBid.unitBid * item.quantity : null)
          return (
            <div className="text-right font-semibold">
              {price != null ? formatPHP(price) : '-'}
            </div>
          )
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-center">Action</div>,
        size: 120,
        cell: (info) => (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewItemDetails?.(info.row.original)}
              className="h-7 text-xs gap-1"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              View
            </Button>
          </div>
        ),
      })
    )
    return columns as ColumnDef<ItemSummary>[]
  }

  // Detailed variant
  columns.push(
    columnHelper.accessor('itemCode', {
      header: () => <div className="text-center font-bold">Item</div>,
      size: 90,
      cell: (info) => (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          {info.getValue() as string}
        </span>
      ),
    }),
    columnHelper.accessor('description', {
      header: () => <div className="text-center font-bold">Description</div>,
      size: 220,
      cell: (info) => (
        <div>
          <div className="font-semibold text-sm text-gray-900 line-clamp-1">{info.row.original.itemName || (info.getValue() as string)}</div>
          <div className="text-xs text-muted-foreground line-clamp-2">{info.getValue() as string}</div>
        </div>
      ),
    }),
    columnHelper.accessor('quantity', {
      header: () => <div className="text-center font-bold">Qty</div>,
      size: 70,
      cell: (info) => (
        <div className="text-center font-medium text-xs">
          {info.getValue() as number} {info.row.original.unit || 'unit'}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'abc',
      header: () => <div className="text-center font-bold">ABC Budget</div>,
      size: 130,
      cell: (info) => {
        const item = info.row.original
        const unitABC = item.abcUnitPrice ?? (item.quantity > 0 ? item.abc / item.quantity : item.abc)
        const unitSingular = (item.unit || 'unit').replace(/s$/, '')
        return (
          <div className="text-right">
            <div className="font-bold text-sm text-gray-900 whitespace-nowrap">{formatPHP(item.abc)}</div>
            <div className="text-[11px] text-muted-foreground whitespace-nowrap">{formatPHP(unitABC)} / {unitSingular}</div>
          </div>
        )
      },
    }),
    columnHelper.display({
      id: 'bids',
      header: () => <div className="text-center font-bold">Bids</div>,
      size: 80,
      cell: (info) => {
        const item = info.row.original
        return (
          <div className="text-center">
            <span className="text-xs font-semibold bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
              {item.responsiveBids}/{item.totalBids}
            </span>
          </div>
        )
      },
    }),
    columnHelper.display({
      id: 'winner',
      header: () => <div className="text-center font-bold">Awarded Supplier</div>,
      size: 200,
      cell: (info) => {
        const item = info.row.original
        return item.winnerSupplier ? (
          <div className="flex items-start gap-2">
            <Trophy className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-gray-900 truncate" title={item.winnerSupplier}>
                {item.winnerSupplier}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">
                {item.winnerBid?.winningReason || 'Lowest Calculated Responsive Bid'}
              </div>
            </div>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-medium">
            <AlertCircle className="w-3 h-3" /> Not Awarded
          </span>
        )
      },
    }),
    columnHelper.display({
      id: 'winnerPrice',
      header: () => <div className="text-center font-bold">Award Unit Price</div>,
      size: 130,
      cell: (info) => {
        const item = info.row.original
        const unitBid = item.winnerBid?.unitBid ?? item.winnerBid?.unitPrice
        const unitSingular = (item.unit || 'unit').replace(/s$/, '')
        return (
          <div className="text-right">
            <div className="font-bold text-sm text-gray-900 whitespace-nowrap">
              {unitBid != null ? formatPHP(unitBid) : '-'}
            </div>
            <div className="text-[11px] text-muted-foreground whitespace-nowrap">
              per {unitSingular}
            </div>
          </div>
        )
      },
    }),
    columnHelper.display({
      id: 'awardTotal',
      header: () => <div className="text-center font-bold">Total Award</div>,
      size: 140,
      cell: (info) => {
        const item = info.row.original
        const totalBid = item.winnerBid?.totalBid ?? (item.winnerBid?.unitBid ? item.winnerBid.unitBid * item.quantity : null)
        const exceedsABC = totalBid != null && totalBid > item.abc
        const baseUnit = (item.unit || 'unit').replace(/s$/, '')
        const unitLabel = item.quantity === 1 ? baseUnit : `${baseUnit}s`
        return (
          <div className="text-right">
            <div className={`font-bold text-sm whitespace-nowrap ${exceedsABC ? 'text-red-600' : 'text-emerald-700'}`}>
              {totalBid != null ? formatPHP(totalBid) : '-'}
            </div>
            {exceedsABC ? (
              <Badge variant="soft" className="text-[10px] bg-red-100 text-red-800">
                Over ABC
              </Badge>
            ) : (
              <div className="text-[11px] text-emerald-700 font-medium whitespace-nowrap">
                {item.quantity} {unitLabel}
              </div>
            )}
          </div>
        )
      },
    }),
    columnHelper.display({
      id: 'savings',
      header: () => <div className="text-center font-bold">Budget Savings</div>,
      size: 160,
      cell: (info) => {
        const item = info.row.original
        if (!item.winnerSupplier) return <div className="text-right text-gray-400 text-sm whitespace-nowrap">-</div>

        if (item.savingsAmount > 0) {
          return (
            <div className="text-right">
              <div className="font-bold text-sm text-emerald-600 whitespace-nowrap">
                +{formatPHP(item.savingsAmount)}
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold whitespace-nowrap">
                ({item.savingsPercentage.toFixed(1)}% saved)
              </div>
            </div>
          )
        } else if (item.savingsAmount === 0) {
          return (
            <div className="text-right">
              <div className="font-medium text-xs text-gray-600 whitespace-nowrap">₱0.00</div>
              <div className="text-[10px] text-gray-400 whitespace-nowrap">(0.0%)</div>
            </div>
          )
        } else {
          return (
            <div className="text-right">
              <div className="font-bold text-sm text-red-600 whitespace-nowrap">
                -{formatPHP(Math.abs(item.savingsAmount))}
              </div>
              <div className="text-[11px] text-red-600 font-semibold whitespace-nowrap">
                ({Math.abs(item.savingsPercentage).toFixed(1)}% over)
              </div>
            </div>
          )
        }
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-center font-bold">Actions</div>,
      size: 165,
      cell: (info) => {
        const item = info.row.original
        return (
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewItemDetails?.(item)}
              className="h-8 px-2.5 text-xs font-medium gap-1.5 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>View Item Bid Details</span>
            </Button>
          </div>
        )
      },
    })
  )

  return columns as ColumnDef<ItemSummary>[]
}

export function ItemBidDetailsTable({
  lineItems,
  bids = [],
  aob,
  variant = 'detailed',
  onSelectWinners,
  isApproved,
}: ItemBidDetailsTableProps) {
  const [viewingItem, setViewingItem] = useState<ItemSummary | null>(null)

  // Build item summaries with comprehensive winner, bid, and savings resolution
  const itemSummaries = useMemo<ItemSummary[]>(() => {
    return lineItems.map((item, index) => {
      // Find all bids for this line item
      const itemBids = (item.lineItems && item.lineItems.length > 0)
        ? item.lineItems
        : bids.filter((b) => b.lineItemId === item.id || b.rfqItemId === item.rfqItemId || b.rfqItemId === item.id)

      const responsiveBids = itemBids.filter((b) => b.unitBid != null && b.isResponsive !== false)

      // 1. Check if an official awarded item exists on the AOB entity
      const awardedItem = aob?.awardedItems?.find(
        (ai) => ai.rfqItemId === item.rfqItemId || ai.rfqItemId === item.id
      )

      let winnerBid = itemBids.find((b) => b.isWinner)
      let winnerSupplier = winnerBid?.supplierName
      let winnerSupplierId = winnerBid?.supplierId

      if (awardedItem) {
        winnerSupplier = awardedItem.winningSupplierName
        winnerSupplierId = awardedItem.winningSupplierId
        winnerBid = itemBids.find((b) => b.supplierId === awardedItem.winningSupplierId) || {
          supplierId: awardedItem.winningSupplierId,
          supplierName: awardedItem.winningSupplierName,
          unitBid: awardedItem.awardedUnitPrice,
          totalBid: awardedItem.totalAwardedAmount || (awardedItem.awardedUnitPrice * awardedItem.awardedQuantity),
          isWinner: true,
          winningReason: awardedItem.awardReason || 'Lowest calculated responsive quotation',
        }
      } else if (item.selectedWinnerId) {
        winnerSupplierId = item.selectedWinnerId
        winnerBid = item.selectedWinnerBid || itemBids.find((b) => b.supplierId === item.selectedWinnerId)
        winnerSupplier = winnerBid?.supplierName
      }

      // Sorted bids for second place calculation
      const sortedBids = [...itemBids].sort((a, b) => {
        const priceA = a.unitBid ?? a.unitPrice ?? Infinity
        const priceB = b.unitBid ?? b.unitPrice ?? Infinity
        return priceA - priceB
      })

      const secondPlace = sortedBids.find((b) => b.supplierId !== winnerSupplierId && b.isResponsive)

      const abc = item.totalABC
        || (item.abcUnitPrice ? item.abcUnitPrice * item.quantity : 0)
        || item.approvedBudgetForContract
        || 0
      const awardedTotal = winnerBid?.totalBid ?? (winnerBid?.unitBid ? winnerBid.unitBid * item.quantity : 0)

      const savingsAmount = winnerSupplier ? abc - awardedTotal : 0
      const savingsPercentage = winnerSupplier && abc > 0 ? (savingsAmount / abc) * 100 : 0

      return {
        itemId: item.id,
        rfqItemId: item.rfqItemId,
        itemCode: item.itemCode || `Item #${index + 1}`,
        description: item.description || item.itemName || 'Line item',
        itemName: item.itemName || item.name,
        quantity: item.quantity,
        unit: item.unit || 'unit',
        abc,
        abcUnitPrice: item.abcUnitPrice,
        winnerSupplier,
        winnerSupplierId,
        winnerBid,
        secondPlace,
        totalBids: itemBids.length,
        responsiveBids: responsiveBids.length,
        savingsAmount,
        savingsPercentage,
        rawItem: item,
        allBids: itemBids,
      }
    })
  }, [lineItems, bids, aob])

  const columns = useMemo(
    () => createItemBidColumns(variant, (item) => setViewingItem(item)),
    [variant]
  )

  const table = useReactTable({
    data: itemSummaries,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Award Statistics calculations
  const totalItems = itemSummaries.length
  const awardedCount = itemSummaries.filter((i) => i.winnerSupplier).length
  const pendingCount = totalItems - awardedCount
  const allAwarded = totalItems > 0 && awardedCount === totalItems

  const totalABC = useMemo(() => {
    return itemSummaries.reduce((sum, item) => sum + item.abc, 0)
  }, [itemSummaries])

  const totalAwardAmount = useMemo(() => {
    return itemSummaries.reduce((sum, item) => {
      if (!item.winnerSupplier) return sum
      return sum + (item.winnerBid?.totalBid ?? (item.winnerBid?.unitBid ? item.winnerBid.unitBid * item.quantity : 0))
    }, 0)
  }, [itemSummaries])

  const totalAwardedABC = useMemo(() => {
    return itemSummaries
      .filter((i) => i.winnerSupplier)
      .reduce((sum, item) => sum + item.abc, 0)
  }, [itemSummaries])

  const totalSavings = totalAwardedABC - totalAwardAmount
  const totalSavingsPercent = totalAwardedABC > 0 ? (totalSavings / totalAwardedABC) * 100 : 0

  const uniqueWinningSuppliers = useMemo(() => {
    const suppliers = new Set<string>()
    itemSummaries.forEach((i) => {
      if (i.winnerSupplier) suppliers.add(i.winnerSupplier)
    })
    return suppliers
  }, [itemSummaries])

  const winningSuppliersSubtitle = useMemo(() => {
    const arr = Array.from(uniqueWinningSuppliers)
    if (arr.length === 0) return 'No suppliers awarded yet'
    if (arr.length === 1) return arr[0]
    return `Across ${arr.length} unique vendors`
  }, [uniqueWinningSuppliers])

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle>Award Summary & Recommendation</CardTitle>
              <CardDescription>
                Consolidated winning suppliers, contract amounts, and savings per line item
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {totalSavings > 0 && (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 py-1 px-3 text-xs gap-1.5 font-semibold">
                  <TrendingDown className="w-3.5 h-3.5" />
                  Overall Savings: {formatPHP(totalSavings)} ({totalSavingsPercent.toFixed(1)}%)
                </Badge>
              )}
              {onSelectWinners && (
                <Button
                  variant={isApproved ? 'outline' : (allAwarded ? 'outline' : 'default')}
                  size="sm"
                  onClick={onSelectWinners}
                  className="gap-1.5 ml-2"
                >
                  <Trophy className={`w-4 h-4 ${isApproved ? 'text-amber-500' : ''}`} />
                  {isApproved ? 'Review Award Decisions' : (allAwarded ? 'Edit Winners' : 'Select Winners')}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {/* 1. Total Line Items */}
            <div className="p-4 bg-blue-50/70 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/50 flex flex-col justify-between h-full">
              <div>
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Total Line Items
                </div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {totalItems}
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Total ABC: {formatPHP(totalABC)}
              </div>
            </div>

            {/* 2. Items Awarded */}
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-900/50 flex flex-col justify-between h-full">
              <div>
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Items Awarded
                </div>
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                  {awardedCount} of {totalItems}
                </div>
              </div>
              <div className="mt-2">
                {allAwarded ? (
                  <Badge variant="soft" className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                    100% Completed
                  </Badge>
                ) : (
                  <Badge variant="soft" className="bg-amber-100 text-amber-800 text-[10px] font-semibold">
                    {pendingCount} Pending Award
                  </Badge>
                )}
              </div>
            </div>

            {/* 3. Winning Suppliers */}
            <div className="p-4 bg-purple-50/70 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900/50 flex flex-col justify-between h-full">
              <div>
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Winning Suppliers
                </div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                  {uniqueWinningSuppliers.size}
                </div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 truncate" title={winningSuppliersSubtitle}>
                {winningSuppliersSubtitle}
              </div>
            </div>

            {/* 4. Total Award Amount & Savings */}
            <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900/50 flex flex-col justify-between h-full">
              <div>
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Total Award Amount
                </div>
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                  {formatPHP(totalAwardAmount)}
                </div>
              </div>
              {totalAwardedABC > 0 && totalAwardAmount > 0 ? (
                <div className={`text-xs font-semibold ${totalSavings >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'} flex items-center gap-1 mt-2`}>
                  <TrendingDown className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    Savings: {totalSavings >= 0 ? '' : '-'}{formatPHP(Math.abs(totalSavings))} ({totalSavingsPercent.toFixed(1)}% vs ABC)
                  </span>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground mt-2">Awaiting winner selection</div>
              )}
            </div>
          </div>

          {/* Winning Supplier Clarification Callout */}
          {allAwarded && uniqueWinningSuppliers.size === 1 && (
            <div className="flex items-center gap-2.5 p-3 bg-blue-50/70 rounded-lg border border-blue-200 text-xs text-blue-950 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-200">
              <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                All <strong>{totalItems} line items</strong> are awarded to a single winning supplier:{' '}
                <strong className="font-semibold text-blue-900 dark:text-blue-100">{Array.from(uniqueWinningSuppliers)[0]}</strong> (lowest responsive quotation across all items).
              </span>
            </div>
          )}

          {allAwarded && uniqueWinningSuppliers.size > 1 && (
            <div className="flex items-center gap-2.5 p-3 bg-purple-50/70 rounded-lg border border-purple-200 text-xs text-purple-950 dark:bg-purple-950/30 dark:border-purple-800 dark:text-purple-200">
              <Trophy className="w-4 h-4 text-purple-500 shrink-0" />
              <span>
                Line-item procurement awarded across <strong>{uniqueWinningSuppliers.size} different winning suppliers</strong> ({Array.from(uniqueWinningSuppliers).join(', ')}).
              </span>
            </div>
          )}

          {/* Status Alert */}
          {!allAwarded && totalItems > 0 && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm text-amber-900">
                  {pendingCount} line item{pendingCount > 1 ? 's' : ''} awaiting award decision
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Review submitted quotations in the Bid Evaluation Matrix and select winning suppliers for each line item.
                </p>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto border rounded-lg">
            <UITable>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-slate-100 dark:bg-slate-800 border-b">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        style={{
                          width: header.getSize(),
                        }}
                        className="text-xs font-bold text-foreground text-center py-3"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-8 text-sm text-muted-foreground">
                      No line items available in this AOB.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="bg-card hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors border-b">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{
                            width: cell.column.getSize(),
                          }}
                          className="py-3.5 align-middle"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </UITable>
          </div>
        </CardContent>
      </Card>

      {/* View Item Bid Details Dialog */}
      <ItemBidDetailsDialog
        open={Boolean(viewingItem)}
        onOpenChange={(open) => !open && setViewingItem(null)}
        item={viewingItem}
      />
    </>
  )
}

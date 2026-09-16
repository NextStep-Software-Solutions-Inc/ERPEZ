/**
 * Item Bid Details Table Component
 * Summary view of winning bids for each line item
 * Shows final award decisions and pricing
 */

import { useMemo, useState } from 'react'
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
import { Trophy, AlertCircle, Eye, TrendingDown } from 'lucide-react'
import { BidDetailsViewer } from '../components/BidDetailsViewer'
import type { SupplierBid, LineItem } from '../types/aobTypes'

interface ItemBidDetailsTableProps {
  lineItems: LineItem[]
  bids: SupplierBid[]
  variant?: 'compact' | 'detailed'
  onSelectWinners?: () => void
  isApproved?: boolean
}

interface ItemSummary {
  itemId: string
  itemCode: string
  description: string
  quantity: number
  unit: string
  unitABC: number
  totalABC: number
  winnerSupplier?: string
  winnerBid?: SupplierBid
  secondPlace?: SupplierBid
  totalBids: number
  responsiveBids: number
  rawItem: LineItem
}

const columnHelper = createColumnHelper<ItemSummary>()

/**
 * Create column definitions for item bid summary
 */
function createItemBidColumns(
  variant: 'compact' | 'detailed' = 'detailed',
  onViewBidDetails?: (bid: SupplierBid, item: LineItem) => void
): ColumnDef<ItemSummary>[] {
  // Columns inferred by columnHelper; return type ensures type safety
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
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{item.winnerSupplier}</span>
            </div>
          ) : (
            <span className="text-xs bg-amber-50 px-2 py-1 rounded">
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
          return (
            <div className="text-right font-semibold">
              {item.winnerBid?.totalBid ? `₱${item.winnerBid.totalBid.toLocaleString()}` : '-'}
            </div>
          )
        },
      })
    )
    return columns as ColumnDef<ItemSummary>[]
  }

  // Detailed variant
  columns.push(
    columnHelper.accessor('itemCode', {
      header: 'Item',
      size: 80,
      cell: (info) => (
        <div>
          <div className="font-semibold text-sm">{info.getValue() as string}</div>
        </div>
      ),
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      size: 200,
      cell: (info) => (
        <div className="text-sm text-gray-700 line-clamp-2">{info.getValue() as string}</div>
      ),
    }),
    columnHelper.accessor('quantity', {
      header: 'Qty',
      size: 60,
      cell: (info) => (
        <div className="text-center">
          {info.getValue() as number} {info.row.original.unit}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'abc',
      header: 'Approved ABC',
      size: 130,
      cell: (info) => {
        const item = info.row.original
        return (
          <div className="text-right">
            <div className="font-semibold text-sm">₱{item.totalABC.toLocaleString()}</div>
            <div className="text-[11px] text-gray-500">₱{item.unitABC.toLocaleString()} / unit</div>
          </div>
        )
      },
    }),
    columnHelper.display({
      id: 'bids',
      header: 'Bids',
      size: 70,
      cell: (info) => {
        const item = info.row.original
        return (
          <div className="text-center">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded font-medium">
              {item.responsiveBids}/{item.totalBids}
            </span>
          </div>
        )
      },
    }),
    columnHelper.display({
      id: 'winner',
      header: 'Awarded Supplier',
      size: 200,
      cell: (info) => {
        const item = info.row.original
        return item.winnerSupplier ? (
          <div className="flex items-start gap-2">
            <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-gray-900 truncate">{item.winnerSupplier}</div>
              {(item.winnerBid?.brand || item.winnerBid?.model) && (
                <div className="text-xs text-gray-600 truncate">
                  {[item.winnerBid.brand, item.winnerBid.model].filter(Boolean).join(' - ')}
                </div>
              )}
              {item.winnerBid?.score != null && (
                <div className="text-[11px] text-emerald-700 font-medium">
                  Score: {item.winnerBid.score}%
                </div>
              )}
            </div>
          </div>
        ) : (
          <span className="text-xs bg-amber-50 px-2 py-1 rounded text-amber-900 font-medium">
            ⚠️ Not Awarded
          </span>
        )
      },
    }),
    columnHelper.display({
      id: 'winnerPrice',
      header: 'Unit Price',
      size: 120,
      cell: (info) => (
        <div className="text-right font-semibold text-sm">
          {info.row.original.winnerBid?.unitBid
            ? `₱${info.row.original.winnerBid.unitBid.toLocaleString()}`
            : '-'}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'awardTotal',
      header: 'Total Award',
      size: 140,
      cell: (info) => {
        const item = info.row.original
        const exceedsABC = item.winnerBid?.totalBid && item.winnerBid.totalBid > item.totalABC
        return (
          <div className={`text-right font-bold text-sm flex items-center justify-end gap-1.5 ${exceedsABC ? 'text-red-600 bg-red-50 px-2 py-1 rounded' : 'text-green-700'}`}>
            {item.winnerBid?.totalBid
              ? `₱${item.winnerBid.totalBid.toLocaleString()}`
              : '-'}
            {exceedsABC && (
              <Badge variant="soft" className="text-xs bg-red-200 text-red-800 whitespace-nowrap">
                Over ABC
              </Badge>
            )}
          </div>
        )
      },
    }),
    columnHelper.display({
      id: 'savings',
      header: 'Budget Savings',
      size: 140,
      cell: (info) => {
        const item = info.row.original
        if (!item.winnerBid?.totalBid) return <span className="text-gray-400">-</span>
        const savings = item.totalABC - item.winnerBid.totalBid
        const savingsPercent = item.totalABC > 0 ? (savings / item.totalABC) * 100 : 0
        const isPositive = savings >= 0

        return (
          <div className="text-right">
            <span className={`font-semibold text-sm flex items-center justify-end gap-1 ${isPositive ? 'text-emerald-700' : 'text-red-700'}`}>
              {isPositive && <TrendingDown className="w-3.5 h-3.5" />}
              ₱{Math.abs(savings).toLocaleString()}
            </span>
            <span className={`text-[11px] ${isPositive ? 'text-emerald-600 font-medium' : 'text-red-600'}`}>
              ({savingsPercent.toFixed(1)}%)
            </span>
          </div>
        )
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      size: 130,
      cell: (info) => {
        const item = info.row.original
        return item.winnerBid ? (
          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => onViewBidDetails?.(item.winnerBid!, item.rawItem)}
            >
              <Eye className="w-3.5 h-3.5 text-gray-500" />
              View Item Bid
            </Button>
          </div>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )
      },
    })
  )
  
  return columns as ColumnDef<ItemSummary>[]
}

export function ItemBidDetailsTable({
  lineItems,
  bids,
  variant = 'detailed',
  onSelectWinners,
  isApproved,
}: ItemBidDetailsTableProps) {
  const [viewingBid, setViewingBid] = useState<{
    open: boolean
    bid: SupplierBid | null
    item: LineItem | null
  }>({
    open: false,
    bid: null,
    item: null,
  })

  const columns = useMemo(
    () =>
      createItemBidColumns(variant, (bid, item) => {
        setViewingBid({ open: true, bid, item })
      }),
    [variant]
  )

  // Build item summaries
  const itemSummaries = useMemo<ItemSummary[]>(() => {
    return lineItems.map((item) => {
      const itemBids = bids.filter((bid) => bid.lineItemId === item.id || bid.rfqItemId === item.id)
      const responsiveBids = itemBids.filter((bid) => bid.unitBid != null)
      const winnerBid = itemBids.find((bid) => bid.isWinner) || 
        (item.selectedWinnerId ? itemBids.find((bid) => bid.supplierId === item.selectedWinnerId) : undefined)
      const sortedBids = [...itemBids].sort((a, b) => {
        if (!a.unitBid) return 1
        if (!b.unitBid) return -1
        return a.unitBid - b.unitBid
      })

      const unitABC = item.abcUnitPrice || item.approvedBudgetForContract || 0
      const totalABC = item.totalABC || (unitABC * (item.quantity || 1))

      return {
        itemId: item.id,
        itemCode: item.itemCode || item.id.substring(0, 8),
        description: item.description || item.name || '',
        quantity: item.quantity,
        unit: item.unit || 'units',
        unitABC,
        totalABC,
        winnerSupplier: winnerBid?.supplierName,
        winnerBid,
        secondPlace: sortedBids[1] && sortedBids[1].id !== winnerBid?.id ? sortedBids[1] : undefined,
        totalBids: itemBids.length,
        responsiveBids: responsiveBids.length,
        rawItem: item,
      }
    })
  }, [lineItems, bids])

  const winningSuppliers = useMemo(() => {
    return Array.from(new Set(itemSummaries.map((i) => i.winnerSupplier).filter(Boolean) as string[]))
  }, [itemSummaries])

  const table = useReactTable({
    data: itemSummaries,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Check if all items are awarded
  const allAwarded = itemSummaries.every((item) => item.winnerSupplier)
  const totalAwardAmount = itemSummaries.reduce(
    (sum, item) => sum + (item.winnerBid?.totalBid || 0),
    0
  )
  const totalApprovedABC = itemSummaries.reduce((sum, item) => sum + item.totalABC, 0)
  const totalSavings = totalApprovedABC - totalAwardAmount
  const totalSavingsPercent = totalApprovedABC > 0 ? (totalSavings / totalApprovedABC) * 100 : 0

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Award Recommendation & Summary</CardTitle>
              <CardDescription>
                Final BAC bid evaluation, ranking, and award recommendations by line item
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {totalSavings > 0 && (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 py-1 px-3 text-xs gap-1.5 font-semibold">
                  <TrendingDown className="w-3.5 h-3.5" />
                  Overall Savings: ₱{totalSavings.toLocaleString()} ({totalSavingsPercent.toFixed(1)}%)
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
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <div className="text-xs text-gray-600">Total Line Items</div>
              <div className="text-2xl font-bold text-blue-600">{itemSummaries.length}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">procurement scope</div>
            </div>
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <div className="text-xs text-gray-600">Items Awarded</div>
              <div className="text-2xl font-bold text-green-600">
                {itemSummaries.filter((i) => i.winnerSupplier).length} / {itemSummaries.length}
              </div>
              <div className="text-[11px] text-green-700 font-medium mt-0.5">
                {allAwarded ? '100% evaluated' : `${itemSummaries.filter((i) => !i.winnerSupplier).length} pending`}
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded border border-amber-200">
              <div className="text-xs text-gray-600">Winning Suppliers</div>
              <div className="text-2xl font-bold text-amber-700">
                {winningSuppliers.length}
              </div>
              <div className="text-[11px] text-amber-800 truncate mt-0.5" title={winningSuppliers.join(', ')}>
                {winningSuppliers.length === 1 ? winningSuppliers[0] : `${winningSuppliers.length} unique awardees`}
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded border border-purple-200">
              <div className="text-xs text-gray-600">Total Award Amount</div>
              <div className="text-xl font-bold text-purple-600">
                ₱{totalAwardAmount.toLocaleString()}
              </div>
              <div className="text-[11px] text-purple-700 mt-0.5">
                {totalSavings > 0 ? `Savings: ₱${totalSavings.toLocaleString()}` : 'Within Approved ABC'}
              </div>
            </div>
          </div>

          {/* Winning Supplier Clarification Callout */}
          {allAwarded && winningSuppliers.length === 1 && (
            <div className="flex items-center gap-2.5 p-3 bg-blue-50/70 rounded border border-blue-200 text-xs text-blue-950">
              <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                All <strong>{itemSummaries.length} line items</strong> are awarded to a single winning supplier:{' '}
                <strong className="font-semibold text-blue-900">{winningSuppliers[0]}</strong> (lowest responsive quotation across all items).
              </span>
            </div>
          )}

          {allAwarded && winningSuppliers.length > 1 && (
            <div className="flex items-center gap-2.5 p-3 bg-purple-50/70 rounded border border-purple-200 text-xs text-purple-950">
              <Trophy className="w-4 h-4 text-purple-500 shrink-0" />
              <span>
                Line-item procurement awarded across <strong>{winningSuppliers.length} different winning suppliers</strong> ({winningSuppliers.join(', ')}).
              </span>
            </div>
          )}

          {/* Status Alert */}
          {!allAwarded && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded border border-amber-200">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm text-amber-900">
                  {itemSummaries.filter((i) => !i.winnerSupplier).length} items awaiting award
                </h4>
                <p className="text-xs text-amber-800 mt-1">
                  Please select winners for all line items before submitting
                </p>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto border rounded">
            <UITable>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        style={{
                          width: header.getSize(),
                        }}
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
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: cell.column.getSize(),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </UITable>
          </div>
        </CardContent>
      </Card>

      {/* View Item Bid Details Dialog */}
      {viewingBid.bid && viewingBid.item && (
        <BidDetailsViewer
          open={viewingBid.open}
          onOpenChange={(open) => {
            if (!open) setViewingBid({ open: false, bid: null, item: null })
          }}
          itemCode={viewingBid.item.itemCode || viewingBid.item.id.substring(0, 8)}
          itemDescription={viewingBid.item.description || viewingBid.item.name || ''}
          itemABC={viewingBid.item.totalABC || ((viewingBid.item.abcUnitPrice || viewingBid.item.approvedBudgetForContract || 0) * (viewingBid.item.quantity || 1))}
          unitABC={viewingBid.item.abcUnitPrice || viewingBid.item.approvedBudgetForContract}
          quantity={viewingBid.item.quantity}
          supplierName={viewingBid.bid.supplierName}
          bidDetails={{
            unitBid: viewingBid.bid.unitBid,
            totalBid: viewingBid.bid.totalBid,
            brand: viewingBid.bid.brand,
            model: viewingBid.bid.model,
            color: viewingBid.bid.color,
            rank: viewingBid.bid.rank,
            score: viewingBid.bid.score,
            qualityScore: viewingBid.bid.qualityScore,
            calculatedQualityPriceRatio: viewingBid.bid.calculatedQualityPriceRatio,
            remarks: viewingBid.bid.remarks,
            offerDocumentUrl: viewingBid.bid.brochureFileUrl || viewingBid.bid.offerDocumentUrl,
            brochureFileUrl: viewingBid.bid.brochureFileUrl,
            isWinner: viewingBid.bid.isWinner,
          }}
        />
      )}
    </>
  )
}

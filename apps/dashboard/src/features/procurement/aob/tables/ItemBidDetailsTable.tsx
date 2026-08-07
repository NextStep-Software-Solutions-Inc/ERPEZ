/**
 * Item Bid Details Table Component
 * Summary view of winning bids for each line item
 * Shows final award decisions and pricing
 */

import { useMemo } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, AlertCircle } from 'lucide-react'
import type { SupplierBid, LineItem } from '../types/aobTypes'

interface ItemBidDetailsTableProps {
  lineItems: LineItem[]
  bids: SupplierBid[]
  variant?: 'compact' | 'detailed'
}

interface ItemSummary {
  itemId: string
  itemCode: string
  description: string
  quantity: number
  unit: string
  abc: number
  winnerSupplier?: string
  winnerBid?: SupplierBid
  secondPlace?: SupplierBid
  totalBids: number
  responsiveBids: number
}

const columnHelper = createColumnHelper<ItemSummary>()

/**
 * Create column definitions for item bid summary
 */
function createItemBidColumns(variant: 'compact' | 'detailed' = 'detailed'): ColumnDef<ItemSummary>[] {
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
      header: 'ABC',
      size: 120,
      cell: (info) => {
        const item = info.row.original
        return (
          <div className="text-right font-semibold text-sm">
            ₱{item.abc.toLocaleString()}
          </div>
        )
      },
    }),
    columnHelper.display({
      id: 'bids',
      header: 'Bids',
      size: 80,
      cell: (info) => {
        const item = info.row.original
        return (
          <div className="text-center">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {item.responsiveBids}/{item.totalBids}
            </span>
          </div>
        )
      },
    }),
    columnHelper.display({
      id: 'winner',
      header: 'Awarded Supplier',
      size: 180,
      cell: (info) => {
        const item = info.row.original
        return item.winnerSupplier ? (
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-sm">{item.winnerSupplier}</div>
              {item.winnerBid?.qualityScore && (
                <div className="text-xs text-gray-600">
                  Quality: {item.winnerBid.qualityScore}/100
                </div>
              )}
            </div>
          </div>
        ) : (
          <span className="text-xs bg-amber-50 px-2 py-1 rounded text-amber-900">
            ⚠️ Not Awarded
          </span>
        )
      },
    }),
    columnHelper.display({
      id: 'winnerPrice',
      header: 'Unit Price',
      size: 130,
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
        const exceedsABC = item.winnerBid?.totalBid && item.winnerBid.totalBid > item.abc
        return (
          <div className={`text-right font-bold text-sm flex items-center justify-end gap-1 ${exceedsABC ? 'text-red-600 bg-red-50 px-2 py-1 rounded' : 'text-green-600'}`}>
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
        if (!item.winnerBid?.totalBid) return <span>-</span>
        return (
          <div className="text-right text-sm">
            <span className="text-gray-600">-</span>
          </div>
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
}: ItemBidDetailsTableProps) {
  const columns = useMemo(() => createItemBidColumns(variant), [variant])

  // Build item summaries
  const itemSummaries = useMemo<ItemSummary[]>(() => {
    return lineItems.map((item) => {
      const itemBids = bids.filter((bid) => bid.lineItemId === item.id)
      // Responsive bids are those with a valid unit bid price
      // Quality score requirements depend on the award criterion (LCRB/MEARB/MARB)
      // and should be validated separately based on the specific criterion
      const responsiveBids = itemBids.filter((bid) => bid.unitBid != null)
      const winnerBid = itemBids.find((bid) => bid.isWinner)
      const sortedBids = [...itemBids].sort((a, b) => {
        if (!a.unitBid) return 1
        if (!b.unitBid) return -1
        return a.unitBid - b.unitBid
      })

      return {
        itemId: item.id,
        itemCode: item.itemCode,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        abc: item.approvedBudgetForContract,
        winnerSupplier: winnerBid?.supplierName,
        winnerBid,
        secondPlace: sortedBids[1] && sortedBids[1].id !== winnerBid?.id ? sortedBids[1] : undefined,
        totalBids: itemBids.length,
        responsiveBids: responsiveBids.length,
      }
    })
  }, [lineItems, bids])

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Award Summary</CardTitle>
        <CardDescription>
          Final bid evaluation and award decisions by line item
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <div className="text-xs text-gray-600">Total Items</div>
            <div className="text-2xl font-bold text-blue-600">{itemSummaries.length}</div>
          </div>
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <div className="text-xs text-gray-600">Awarded</div>
            <div className="text-2xl font-bold text-green-600">
              {itemSummaries.filter((i) => i.winnerSupplier).length}
            </div>
          </div>
          <div className="p-3 bg-amber-50 rounded border border-amber-200">
            <div className="text-xs text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-amber-600">
              {itemSummaries.filter((i) => !i.winnerSupplier).length}
            </div>
          </div>
          <div className="p-3 bg-purple-50 rounded border border-purple-200">
            <div className="text-xs text-gray-600">Total Award</div>
            <div className="text-lg font-bold text-purple-600">
              ₱{totalAwardAmount.toLocaleString()}
            </div>
          </div>
        </div>

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
  )
}

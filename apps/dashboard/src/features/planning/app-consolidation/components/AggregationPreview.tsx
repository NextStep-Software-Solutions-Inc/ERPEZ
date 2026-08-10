import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AggregatedItem, PPMPItem } from '../types'

interface AggregationPreviewProps {
  items: PPMPItem[]
}

const columnHelper = createColumnHelper<AggregatedItem>()

function aggregateByUnit(items: PPMPItem[]): AggregatedItem[] {
  const grouped = items.reduce(
    (acc, item) => {
      if (!acc[item.unit]) {
        acc[item.unit] = {
          unit: item.unit,
          items: [],
          totalQuantity: 0,
          totalAmount: 0,
        }
      }
      acc[item.unit].items.push(item)
      acc[item.unit].totalQuantity += item.quantity
      acc[item.unit].totalAmount += item.totalAmount
      return acc
    },
    {} as Record<string, AggregatedItem>,
  )
  return Object.values(grouped)
}

export function AggregationPreview({ items }: AggregationPreviewProps) {
  const aggregatedItems = aggregateByUnit(items)
  const totalBudget = aggregatedItems.reduce((sum, item) => sum + item.totalAmount, 0)

  const columns = [
    columnHelper.accessor('unit', {
      header: 'Unit',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('items', {
      header: 'Item Count',
      cell: (info) => info.getValue().length,
    }),
    columnHelper.accessor('totalQuantity', {
      header: 'Total Quantity',
      cell: (info) => info.getValue().toLocaleString(),
    }),
    columnHelper.accessor('totalAmount', {
      header: 'Total Budget',
      cell: (info) =>
        `₱${info.getValue().toLocaleString('en-PH', { maximumFractionDigits: 2 })}`,
    }),
  ]

  const table = useReactTable({
    data: aggregatedItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aggregation Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 pt-4 border-t flex justify-between">
            <span className="font-medium">Total Budget:</span>
            <span className="font-semibold">
              ₱{totalBudget.toLocaleString('en-PH', { maximumFractionDigits: 2 })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

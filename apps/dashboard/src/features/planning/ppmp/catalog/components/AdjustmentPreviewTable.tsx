/**
 * AdjustmentPreviewTable
 * TanStack Table showing old price → new price delta for each affected item.
 */

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import type { AdjustmentPreviewItem } from '../types'
import { Badge } from '@/components/ui/badge'

function formatPrice(n: number) {
  return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const col = createColumnHelper<AdjustmentPreviewItem>()

const columns = [
  col.accessor('name', {
    header: 'Item',
    cell: (info) => (
      <div>
        <p className="text-sm font-medium truncate max-w-[200px]">
          {info.getValue()}
        </p>
        <p className="text-xs text-muted-foreground">
          {info.row.original.itemCode}
        </p>
      </div>
    ),
  }),
  col.accessor('oldPrice', {
    header: 'Old Price',
    cell: (info) => (
      <span className="text-sm tabular-nums">
        {formatPrice(info.getValue())}
      </span>
    ),
  }),
  col.accessor('newPrice', {
    header: 'New Price',
    cell: (info) => (
      <span className="text-sm font-medium tabular-nums">
        {formatPrice(info.getValue())}
      </span>
    ),
  }),
  col.accessor('delta', {
    header: 'Change',
    cell: (info) => {
      const d = info.getValue()
      return (
        <Badge
          variant={d > 0 ? undefined : 'soft'}
          className="tabular-nums text-xs"
        >
          {d >= 0 ? '+' : ''}
          {formatPrice(d)}
        </Badge>
      )
    },
  }),
]

interface AdjustmentPreviewTableProps {
  items: AdjustmentPreviewItem[]
}

export function AdjustmentPreviewTable({ items }: AdjustmentPreviewTableProps) {
  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border overflow-auto max-h-64 text-sm">
      <table className="w-full">
        <thead className="bg-muted/50 sticky top-0">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className="px-3 py-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap"
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t hover:bg-muted/30">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * NTP Details Line Items Table Component
 * Displays NTP line items in a read-only table with toolbar
 */

import { useMemo } from 'react'
import {
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
import { NTPDetailsToolbar } from './NTPDetailsToolbar'
import { NTPDetailsColumns } from './NTPDetailsColumns'
import { NTPDetailsActions } from './NTPDetailsActions'
import type { NTPLineItem } from '../types/ntpTypes'

export interface NTPDetailsTableProps {
  lineItems: NTPLineItem[]
  isLoading?: boolean
}

export function NTPDetailsTable({
  lineItems,
  isLoading = false,
}: NTPDetailsTableProps) {
  const columns = useMemo(() => {
    const baseColumns = NTPDetailsColumns
    return [
      ...baseColumns,
      {
        id: 'actions',
        cell: () => <NTPDetailsActions isReadOnly={true} />,
      },
    ]
  }, [])

  const totalAmount = useMemo(
    () => lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [lineItems]
  )

  const table = useReactTable({
    data: lineItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading line items...</div>
      </div>
    )
  }

  if (lineItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">No line items</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <NTPDetailsToolbar
        itemsCount={lineItems.length}
        totalAmount={totalAmount}
        isLoading={isLoading}
      />

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-12">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/50">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Total Row */}
      <div className="border rounded-lg bg-muted/50 p-4 flex justify-end">
        <div className="space-y-1">
          <div className="flex justify-between gap-12">
            <span className="text-sm font-medium">Subtotal:</span>
            <span className="font-semibold">
              {new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
              }).format(totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

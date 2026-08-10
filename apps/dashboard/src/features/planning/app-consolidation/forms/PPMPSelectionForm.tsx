import { useMemo, useState } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PPMPItem } from '../types'

interface PPMPSelectionFormProps {
  ppmpData: PPMPItem[]
  onConfirm?: (items: PPMPItem[]) => void
  selectedItems?: PPMPItem[]
}

const columnHelper = createColumnHelper<PPMPItem>()

export function PPMPSelectionForm({
  ppmpData,
  onConfirm,
  selectedItems = [],
}: PPMPSelectionFormProps) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>(
    selectedItems.reduce(
      (acc, item) => {
        acc[ppmpData.indexOf(item)] = true
        return acc
      },
      {} as Record<string, boolean>,
    ),
  )

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="rounded border-gray-300"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-gray-300"
          />
        ),
      }),
      columnHelper.accessor('code', {
        header: 'Code',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('unit', {
        header: 'Unit',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('quantity', {
        header: 'Qty',
        cell: (info) => info.getValue().toLocaleString(),
      }),
      columnHelper.accessor('unitCost', {
        header: 'Unit Cost',
        cell: (info) =>
          `₱${info.getValue().toLocaleString('en-PH', { maximumFractionDigits: 2 })}`,
      }),
      columnHelper.accessor('totalAmount', {
        header: 'Total Amount',
        cell: (info) =>
          `₱${info.getValue().toLocaleString('en-PH', { maximumFractionDigits: 2 })}`,
      }),
    ],
    [],
  )

  const table = useReactTable({
    data: ppmpData,
    columns,
    state: { globalFilter, rowSelection },
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((row) => row.original)

  const selectedCount = Object.values(rowSelection).filter(Boolean).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select PPMP Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Input
            placeholder="Search items..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
          <span className="text-sm text-muted-foreground">
            {selectedCount} selected
          </span>
        </div>

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

        <div className="flex justify-end gap-2">
          <Button onClick={() => onConfirm?.(selectedRows)} disabled={selectedCount === 0}>
            Confirm Selection ({selectedCount})
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

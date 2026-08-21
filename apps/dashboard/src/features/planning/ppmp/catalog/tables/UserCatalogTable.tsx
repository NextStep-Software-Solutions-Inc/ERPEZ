/**
 * UserCatalogTable
 * TanStack Table for displaying active catalog items
 * Features: sorting, column sizing, row click → detail panel
 */

import { useState, useMemo } from 'react'
import { useSetAtom } from 'jotai'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronRight, Package } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { catalogDetailSelectedIdAtom } from '../atoms/requestAtoms'
import type { NONCSEItem } from '@/features/planning/non-cse-item/types/non-cse.type'
import { formatCurrencyPHP } from '@/utils/formatters'

interface UserCatalogTableProps {
  data: NONCSEItem[]
  total?: number
  isLoading?: boolean
}

export function UserCatalogTable({
  data,
  isLoading = false,
}: UserCatalogTableProps) {
  const setSelectedItemId = useSetAtom(catalogDetailSelectedIdAtom)
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: false },
  ])

  const columns = useMemo<ColumnDef<NONCSEItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 font-semibold text-xs uppercase"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Item Name
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <button
            onClick={() => setSelectedItemId(row.original.id)}
            className="text-primary hover:underline font-medium text-left truncate max-w-xs block"
          >
            {row.original.name || 'Unnamed Item'}
          </button>
        ),
      },
      {
        accessorKey: 'procurementCategoryName',
        header: () => (
          <span className="font-semibold text-xs uppercase text-muted-foreground">
            Category
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.procurementCategoryName || 'Goods'}
          </span>
        ),
      },
      {
        accessorKey: 'uomName',
        header: () => (
          <span className="font-semibold text-xs uppercase text-muted-foreground">
            UoM
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.original.uomName || '—'}</span>
        ),
      },
      {
        accessorKey: 'currentPrice',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 font-semibold text-xs uppercase"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Est. Unit Price
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {formatCurrencyPHP(row.original.currentPrice)}
          </span>
        ),
      },
      {
        accessorKey: 'description',
        header: () => (
          <span className="font-semibold text-xs uppercase text-muted-foreground">
            Specifications
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground line-clamp-1 max-w-sm">
            {row.original.description || '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedItemId(row.original.id)}
            className="gap-1 text-xs"
          >
            View
            <ChevronRight className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [setSelectedItemId],
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (isLoading) {
    return (
      <div className="space-y-2 p-4 border rounded-lg">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-muted/60 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg border-dashed">
        <Package className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <h3 className="font-semibold text-base">No Catalog Items Found</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          Items approved through Item Requests will automatically appear in this catalog.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
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
            <TableRow
              key={row.id}
              className="hover:bg-muted/30 cursor-pointer transition-colors"
              onClick={() => setSelectedItemId(row.original.id)}
            >
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
  )
}

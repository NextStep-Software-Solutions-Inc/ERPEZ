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
import { ArrowUpDown, ChevronRight } from 'lucide-react'
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
import type { NonCSEItem } from '../types/catalog.types'

interface UserCatalogTableProps {
  data: NonCSEItem[]
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

  const columns = useMemo<ColumnDef<NonCSEItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Item Name
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <button
            onClick={() => setSelectedItemId(row.original.id)}
            className="text-primary hover:underline font-medium truncate"
          >
            {row.original.name}
          </button>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.category}
          </span>
        ),
      },
      {
        accessorKey: 'unitOfMeasure',
        header: 'UoM',
        cell: ({ row }) => (
          <span className="text-sm">{row.original.unitOfMeasure}</span>
        ),
      },
      {
        accessorKey: 'currentPrice',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Unit Price
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-primary">
            ₱
            {row.original.currentPrice.toLocaleString('en-PH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
      },
      {
        accessorKey: 'specification',
        header: 'Specification',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground line-clamp-2">
            {row.original.specification}
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
            className="gap-2"
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
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
        <p className="text-sm text-muted-foreground">
          No items in the active catalog yet.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
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
            <TableRow
              key={row.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
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

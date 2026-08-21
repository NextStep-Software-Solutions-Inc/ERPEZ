/**
 * UserRequestsTable
 * TanStack Table for displaying user's item requests
 * Features: status filtering, sorting, row click → detail panel
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
import { Badge } from '@/components/ui/badge'
import { requestDetailSelectedIdAtom } from '../atoms/requestAtoms'
import { STATUS_COLORS } from '../utils/cascadingUacs'
import type { ItemRequest } from '../types/catalog.types'

interface UserRequestsTableProps {
  data: ItemRequest[]
  total?: number
  isLoading?: boolean
  selectedStatus?: ItemRequest['status']
}

export function UserRequestsTable({
  data,
  isLoading = false,
  selectedStatus,
}: UserRequestsTableProps) {
  const setSelectedRequestId = useSetAtom(requestDetailSelectedIdAtom)
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'requestDate', desc: true },
  ])

  // Filter by status if provided
  const filteredData = useMemo(() => {
    if (!selectedStatus) return data
    return data.filter((req) => req.status === selectedStatus)
  }, [data, selectedStatus])

  const columns = useMemo<ColumnDef<ItemRequest>[]>(
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
            onClick={() => setSelectedRequestId(row.original.id)}
            className="text-primary hover:underline font-medium truncate"
          >
            {row.original.name}
          </button>
        ),
      },
      {
        accessorKey: 'procurementCategory',
        header: 'Procurement Category',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.procurementCategory}
          </span>
        ),
      },
      {
        accessorKey: 'estimatedUnitCost',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Est. Unit Cost
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-primary">
            ₱
            {row.original.estimatedUnitCost.toLocaleString('en-PH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status
          const colors =
            (STATUS_COLORS as Record<string, string>)[status] ||
            STATUS_COLORS['Submitted']
          return (
            <Badge variant="outline" className={colors}>
              {status}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'requestDate',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Request Date
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm">
            {new Date(row.original.requestDate).toLocaleDateString('en-PH')}
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
            onClick={() => setSelectedRequestId(row.original.id)}
            className="gap-2"
          >
            View
            <ChevronRight className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [setSelectedRequestId],
  )

  const table = useReactTable({
    data: filteredData,
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

  if (filteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
        <p className="text-sm text-muted-foreground">
          {selectedStatus
            ? `No ${selectedStatus.toLowerCase()} requests.`
            : 'You have not submitted any requests yet.'}
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

/**
 * UserRequestsTable
 * TanStack Table for displaying item requests
 * Features: sorting, office & category columns, status badges, row click → detail panel
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
import { ArrowUpDown, ChevronRight, FileQuestion } from 'lucide-react'
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
  selectedStatus?: ItemRequest['status'] | 'all'
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

  // Filter by status if specific status provided
  const filteredData = useMemo(() => {
    if (!selectedStatus || selectedStatus === 'all') return data
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
            className="-ml-3 h-8 text-xs font-semibold uppercase tracking-wider"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Item Name
            <ArrowUpDown className="ml-1.5 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="space-y-0.5 max-w-xs">
            <button
              onClick={() => setSelectedRequestId(row.original.id)}
              className="text-left font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
            >
              {row.original.name}
            </button>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {row.original.itemCategory}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'procurementCategory',
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Procurement Category
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.procurementCategoryName ||
              row.original.procurementCategory ||
              '—'}
          </span>
        ),
      },
      {
        accessorKey: 'office',
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Office
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.officeName || row.original.requestingOffice || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'estimatedUnitCost',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-semibold uppercase tracking-wider"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Est. Unit Cost
            <ArrowUpDown className="ml-1.5 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
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
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Status
          </span>
        ),
        cell: ({ row }) => {
          const status = row.original.status
          const colors =
            (STATUS_COLORS as Record<string, string>)[status] ||
            STATUS_COLORS['Submitted']
          return (
            <Badge variant="outline" className={`font-medium ${colors}`}>
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
            className="-ml-3 h-8 text-xs font-semibold uppercase tracking-wider"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Request Date
            <ArrowUpDown className="ml-1.5 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {new Date(row.original.requestDate).toLocaleDateString('en-PH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRequestId(row.original.id)}
              className="h-8 px-2 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground"
            >
              View
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
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
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-muted/60 rounded animate-pulse w-full"
            />
          ))}
        </div>
      </div>
    )
  }

  if (filteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-border rounded-lg bg-card/50">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
          <FileQuestion className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          {selectedStatus && selectedStatus !== 'all'
            ? `No ${selectedStatus.toLowerCase()} item requests`
            : 'No item requests found'}
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          {selectedStatus === 'Draft'
            ? 'You have no saved drafts. Create a new request and save it as draft to continue later.'
            : selectedStatus === 'Submitted'
              ? 'No requests are currently under Technical Working Group review.'
              : selectedStatus === 'Approved'
                ? 'No requests have been approved yet.'
                : selectedStatus === 'Returned'
                  ? 'No requests have been returned for revision.'
                  : 'Items requested from the catalog will appear here.'}
        </p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-muted/40">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="py-3">
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
              onClick={() => setSelectedRequestId(row.original.id)}
              className="cursor-pointer hover:bg-muted/40 transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-3">
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

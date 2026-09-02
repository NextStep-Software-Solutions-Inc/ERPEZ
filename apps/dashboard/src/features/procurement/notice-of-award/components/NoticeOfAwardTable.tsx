import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  MoreHorizontal,
  Plus,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { NoticeOfAward } from '../types'
import { NoticeOfAwardStatusBadge } from './NoticeOfAwardStatusBadge'
import {
  getNoaContractExecutionSlaState,
} from '../utils/noaContractExecutionSla'

type NoticeOfAwardTableProps = {
  rows: NoticeOfAward[]
  detailsTo: string
  onCreateClick?: () => void
}

export function NoticeOfAwardTable({
  rows,
  detailsTo,
  onCreateClick,
}: NoticeOfAwardTableProps) {
  const [rowSelection, setRowSelection] = useState({})

  const columns = useMemo<ColumnDef<NoticeOfAward>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'noaNumber',
        header: 'NOA No.',
        cell: ({ row }) => (
          <Link
            to={detailsTo}
            params={{ noaId: row.original.id }}
            className="font-medium text-foreground hover:text-primary transition-colors text-sm"
          >
            {row.original.noaNumber}
          </Link>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground truncate max-w-[20rem] inline-block">
            {row.original.description || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'linkedBacResolution',
        header: 'BAC Resolution',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.linkedBacResolution.bacResolutionNumber}
          </span>
        ),
      },
      {
        accessorKey: 'supplierName',
        header: 'Supplier',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.supplierName || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'totalAmount',
        header: 'Awarded Amount',
        cell: ({ row }) => (
          <div className="text-sm font-medium text-foreground">
            ₱{row.original.totalAmount.toLocaleString('en-PH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        ),
      },
      {
        id: 'sla',
        header: '10-Day SLA',
        cell: ({ row }) => (
          <SlaBadge noticeOfAward={row.original} />
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <NoticeOfAwardStatusBadge status={row.original.status} />
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" color="secondary" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link to={detailsTo} params={{ noaId: row.original.id }}>
                    View details
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [detailsTo],
  )

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    state: {
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div className="w-full flex flex-col space-y-3">
      <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'text-sm font-medium text-muted-foreground h-11',
                      header.column.id === 'select' ? 'w-12' : '',
                      header.column.id === 'actions' ? 'text-right' : '',
                    )}
                  >
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="transition-colors hover:bg-muted/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'py-3 text-sm',
                        cell.column.id === 'select' ? 'w-12' : '',
                        cell.column.id === 'actions' ? 'text-right' : '',
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      No notice of awards found
                    </p>
                    {onCreateClick && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onCreateClick}
                        className="gap-1.5 mt-2"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Create NOA
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {table.getRowModel().rows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
          <div>
            Showing{' '}
            <span className="font-medium text-foreground">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium text-foreground">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                rows.length,
              )}
            </span>{' '}
            of <span className="font-medium text-foreground">{rows.length}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {Math.max(1, table.getPageCount())}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SlaBadge({ noticeOfAward }: { noticeOfAward: NoticeOfAward }) {
  const state = getNoaContractExecutionSlaState(noticeOfAward)

  if (!state.isIssued) {
    return (
      <Badge variant="outline" className="border-border text-muted-foreground bg-transparent rounded-full px-2.5 py-0.5 text-xs font-normal">
        Not issued
      </Badge>
    )
  }

  if (state.isComplete) {
    return (
      <Badge variant="outline" className="border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-transparent rounded-full px-2.5 py-0.5 text-xs font-normal">
        Contract Executed
      </Badge>
    )
  }

  if (state.label === 'Issued — Awaiting Conforme') {
    return (
      <div>
        <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400 bg-transparent rounded-full px-2.5 py-0.5 text-xs font-normal">
          Issued — Awaiting Conforme
        </Badge>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Awaiting recipient acknowledgment
        </p>
      </div>
    )
  }

  if (state.isOverdue) {
    return (
      <Badge variant="outline" className="border-rose-500 text-rose-600 dark:text-rose-400 bg-transparent rounded-full px-2.5 py-0.5 text-xs font-normal">
        {state.label}
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="border-sky-500 text-sky-600 dark:text-sky-400 bg-transparent rounded-full px-2.5 py-0.5 text-xs font-normal">
      10-Day SLA ({state.daysRemaining}d left)
    </Badge>
  )
}



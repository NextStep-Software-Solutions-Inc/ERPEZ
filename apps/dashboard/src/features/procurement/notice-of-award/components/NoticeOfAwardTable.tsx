import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MoreHorizontal,
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
  formatNoaSlaDate,
  getNoaContractExecutionSlaState,
} from '../utils/noaContractExecutionSla'

type NoticeOfAwardTableProps = {
  rows: NoticeOfAward[]
  detailsTo: string
}

export function NoticeOfAwardTable({
  rows,
  detailsTo,
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
          <span className="font-medium text-default-900">
            {row.original.noaNumber}
          </span>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <div className="max-w-88 text-default-600">
            <div className="line-clamp-2">{row.original.description}</div>
            <div className="mt-1 text-xs text-default-400">
              {row.original.date} · {row.original.dateBid}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'linkedBacResolution',
        header: 'BAC Resolution',
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-default-900">
              {row.original.linkedBacResolution.bacResolutionNumber}
            </div>
            <div className="mt-1 text-xs text-default-400">
              {row.original.linkedConsolidatedPr.prNumber}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'supplierName',
        header: 'Supplier',
        cell: ({ row }) => <span>{row.original.supplierName}</span>,
      },
      {
        accessorKey: 'totalAmount',
        header: 'Total Amount',
        cell: ({ row }) => (
          <span>
            {row.original.totalAmount.toLocaleString('en-PH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
      },
      {
        id: 'sla',
        header: '10-Day SLA',
        cell: ({ row }) => {
          const noticeOfAward = row.original
          const slaState = getNoaContractExecutionSlaState(noticeOfAward)
          return (
            <div>
              <SlaBadge noticeOfAward={noticeOfAward} />
              {slaState.deadlineDate ? (
                <div className="mt-1 text-xs text-default-400">
                  Due {formatNoaSlaDate(slaState.deadlineDate)}
                </div>
              ) : null}
            </div>
          )
        },
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
                <Button variant="ghost" color="secondary" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
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
        pageSize: 5,
      },
    },
  })

  return (
    <div className="w-full flex flex-col h-full">
      <div className="rounded-2xl border border-default-200 bg-background shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-default-50/70">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'font-bold text-default-900 py-3',
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
                  className="transition-colors duration-150 hover:bg-default-50/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.id === 'actions' ? 'text-right' : ''}
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
                  className="py-10 text-center text-sm text-default-500"
                >
                  No NOAs match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-row items-center justify-between space-x-2 py-4">
        <div className="text-muted-foreground text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="text-muted-foreground text-sm">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

function SlaBadge({ noticeOfAward }: { noticeOfAward: NoticeOfAward }) {
  const state = getNoaContractExecutionSlaState(noticeOfAward)

  if (!state.isIssued) {
    return (
      <Badge className="border border-default-300 bg-default-100 text-default-700">
        Not issued
      </Badge>
    )
  }

  if (state.isComplete) {
    return (
      <Badge className="border border-emerald-300 bg-emerald-50 text-emerald-700">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Complete
      </Badge>
    )
  }

  if (state.isOverdue) {
    return (
      <Badge className="border border-rose-300 bg-rose-50 text-rose-700">
        <AlertTriangle className="mr-1 h-3 w-3" />
        Overdue
      </Badge>
    )
  }

  return (
    <Badge className="border border-amber-300 bg-amber-50 text-amber-700">
      <Clock3 className="mr-1 h-3 w-3" />
      {state.label}
    </Badge>
  )
}

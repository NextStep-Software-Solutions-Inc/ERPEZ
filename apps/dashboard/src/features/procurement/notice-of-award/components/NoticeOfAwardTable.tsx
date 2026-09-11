import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  Building2,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import type { NoticeOfAward, NoticeOfAwardInboxFilter, NoticeOfAwardRole } from '../types'
import { NoticeOfAwardStatusBadge } from './NoticeOfAwardStatusBadge'
import {
  getNoaContractExecutionSlaState,
} from '../utils/noaContractExecutionSla'

type NoticeOfAwardTableProps = {
  rows: NoticeOfAward[]
  detailsTo: string
  onCreateClick?: () => void
  activeStatus?: NoticeOfAwardInboxFilter
  onStatusChange?: (status: NoticeOfAwardInboxFilter) => void
  statusCounts?: {
    all: number
    draft: number
    forApproval: number
    returned: number
    approved: number
  }
  role?: NoticeOfAwardRole
}

export function NoticeOfAwardTable({
  rows,
  detailsTo,
  onCreateClick,
  activeStatus = 'all',
  onStatusChange,
  statusCounts,
  role = 'procurement-staff',
}: NoticeOfAwardTableProps) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

  const filterOptions = useMemo(() => {
    if (role === 'hope') {
      return [
        {
          id: 'all' as NoticeOfAwardInboxFilter,
          label: 'All',
          count: statusCounts ? statusCounts.forApproval + statusCounts.approved : rows.length,
        },
        {
          id: 'for-approval' as NoticeOfAwardInboxFilter,
          label: 'For Approval',
          count: statusCounts?.forApproval ?? rows.filter((r) => r.status === 'for-approval').length,
        },
        {
          id: 'approved' as NoticeOfAwardInboxFilter,
          label: 'Approved / Issued',
          count: statusCounts?.approved ?? rows.filter((r) => r.status === 'approved').length,
        },
      ]
    }

    return [
      {
        id: 'all' as NoticeOfAwardInboxFilter,
        label: 'All',
        count: statusCounts?.all ?? rows.length,
      },
      {
        id: 'draft' as NoticeOfAwardInboxFilter,
        label: 'Draft',
        count: statusCounts?.draft ?? rows.filter((r) => r.status === 'draft').length,
      },
      {
        id: 'for-approval' as NoticeOfAwardInboxFilter,
        label: 'For Approval',
        count: statusCounts?.forApproval ?? rows.filter((r) => r.status === 'for-approval').length,
      },
      {
        id: 'returned' as NoticeOfAwardInboxFilter,
        label: 'Returned',
        count: statusCounts?.returned ?? rows.filter((r) => r.status === 'returned').length,
      },
      {
        id: 'approved' as NoticeOfAwardInboxFilter,
        label: 'Approved / Issued',
        count: statusCounts?.approved ?? rows.filter((r) => r.status === 'approved').length,
      },
    ]
  }, [role, statusCounts, rows])

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
            className="font-bold text-primary hover:underline font-mono text-xs flex items-center gap-1.5"
          >
            <FileText className="h-3.5 w-3.5 text-primary/70 shrink-0" />
            {row.original.noaNumber}
          </Link>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <span
            className="text-sm text-default-700 truncate max-w-[18rem] inline-block font-normal"
            title={row.original.description || undefined}
          >
            {row.original.description || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'linkedBacResolution',
        header: 'BAC Resolution',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-default-700 bg-default-100 px-2 py-0.5 rounded border border-default-200 inline-block font-medium">
            {row.original.linkedBacResolution.bacResolutionNumber}
          </span>
        ),
      },
      {
        accessorKey: 'supplierName',
        header: 'Supplier',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-sm font-medium text-default-900">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate max-w-[14rem]">
              {row.original.supplierName || row.original.linkedConsolidatedPr?.supplierName || 'Winning Bidder'}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'totalAmount',
        header: 'Awarded Amount',
        cell: ({ row }) => (
          <div className="text-sm font-extrabold text-emerald-700">
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
        header: () => (
          <div className="flex items-center gap-1.5">
            <span>Status</span>
            {onStatusChange ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-6 w-6 p-0 hover:bg-default-200',
                      activeStatus && activeStatus !== 'all' && 'text-primary bg-primary/10'
                    )}
                    title="Filter by status"
                  >
                    <Filter className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white shadow-md border-default-200">
                  <DropdownMenuLabel className="text-xs font-bold text-default-700">
                    Filter by Status
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {filterOptions.map((opt) => (
                    <DropdownMenuItem
                      key={opt.id}
                      onClick={() => onStatusChange(opt.id)}
                      className={cn(
                        'flex items-center justify-between text-xs cursor-pointer py-1.5',
                        activeStatus === opt.id && 'font-bold text-primary bg-primary/5'
                      )}
                    >
                      <span>{opt.label}</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 border-default-200 font-semibold"
                      >
                        {opt.count}
                      </Badge>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        ),
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
    [detailsTo, activeStatus, onStatusChange, filterOptions],
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
    <Card className="border border-default-200 shadow-sm bg-white overflow-hidden">
      <CardHeader className="py-4 border-b border-default-100 flex flex-row items-center justify-between">
        <div className="space-y-0.5">
          <CardTitle className="text-base font-bold text-default-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Notice of Award Records & Statutory SLAs
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Official records of issued NOAs, winning bidders, awarded values, and 10-day execution milestones.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-default-50/80">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-default-200">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'text-xs font-bold uppercase tracking-wider text-muted-foreground h-11',
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
                  className="transition-colors hover:bg-default-50/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'py-3.5 text-sm',
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
                  className="py-14 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FileText className="h-8 w-8 text-muted-foreground/40 mb-1" />
                    <p className="text-sm font-medium text-muted-foreground">
                      No notice of awards found in this queue
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
      </CardContent>

      {table.getRowModel().rows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-default-200 bg-default-50/30 text-xs text-muted-foreground">
          <div>
            Showing{' '}
            <span className="font-semibold text-default-900">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-default-900">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                rows.length,
              )}
            </span>{' '}
            of <span className="font-semibold text-default-900">{rows.length}</span> entries
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
                className="h-8 px-3 text-xs bg-white"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs bg-white"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

function SlaBadge({ noticeOfAward }: { noticeOfAward: NoticeOfAward }) {
  const state = getNoaContractExecutionSlaState(noticeOfAward)

  if (!state.isIssued) {
    return (
      <Badge variant="outline" className="border-default-200 text-muted-foreground bg-default-50 rounded-full px-2.5 py-0.5 text-xs font-normal">
        Not issued
      </Badge>
    )
  }

  if (state.isComplete) {
    return (
      <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-0.5 text-xs font-semibold">
        Contract Executed
      </Badge>
    )
  }

  if (state.label === 'Issued — Awaiting Conforme') {
    return (
      <div>
        <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 rounded-full px-2.5 py-0.5 text-xs font-semibold">
          Issued — Awaiting Conforme
        </Badge>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Awaiting recipient acknowledgment
        </p>
      </div>
    )
  }

  if (state.isOverdue) {
    return (
      <Badge variant="outline" className="border-rose-300 text-rose-700 bg-rose-50 rounded-full px-2.5 py-0.5 text-xs font-bold animate-pulse">
        {state.label}
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="border-sky-300 text-sky-700 bg-sky-50 rounded-full px-2.5 py-0.5 text-xs font-semibold">
      10-Day SLA ({state.daysRemaining}d left)
    </Badge>
  )
}



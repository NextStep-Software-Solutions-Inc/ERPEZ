import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Copy,
  CheckCircle2,
  X,
  Upload,
  Calendar,
  Layers,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrencyPHP, formatDateV2 } from '@/utils/formatters'
import { cn } from '@/lib/utils'

import type { DirectContracting, SupplierTableActionHandlers } from './types'

const columnHelper = createColumnHelper<DirectContracting>()

export function renderSupplierStatusBadge(item: DirectContracting) {
  const status = (item.status || '').toLowerCase()
  const hasProposal = Boolean(item.proposalAmount || item.proposal)

  if (status === 'approved') {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 font-semibold text-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 py-1 px-2.5 whitespace-nowrap"
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
        <span>Approved</span>
      </Badge>
    )
  }

  if (status === 'rejected' || status === 'returned') {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 font-semibold text-xs bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 py-1 px-2.5 whitespace-nowrap"
      >
        <X className="h-3.5 w-3.5 text-rose-600" />
        <span>Returned / Revision</span>
      </Badge>
    )
  }

  if (status === 'for-review' || status === 'pending_for_approval' || status === 'submitted' || hasProposal) {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 font-semibold text-xs bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 py-1 px-2.5 whitespace-nowrap"
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-sky-600" />
        <span>Proposal Submitted</span>
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className="gap-1.5 font-semibold text-xs bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 py-1 px-2.5 whitespace-nowrap animate-pulse"
    >
      <Upload className="h-3.5 w-3.5 text-amber-600" />
      <span>Pending Quotation</span>
    </Badge>
  )
}

export function getSupplierDirectContractingColumns(
  handlers: SupplierTableActionHandlers,
): ColumnDef<DirectContracting, any>[] {
  return [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all rows"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    }),

    columnHelper.accessor((row) => row.dcNumber, {
      id: 'dcNumber',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>DC Reference No.</span>
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-3.5 w-3.5 text-primary" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-3.5 w-3.5 text-primary" />
          ) : (
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground/60" />
          )}
        </Button>
      ),
      cell: ({ row }) => {
        const dc = row.original
        return (
          <div className="flex flex-col gap-1 items-start">
            <Link
              to="/v2/supplier-portal/direct-contracting-item/$id"
              params={{ id: dc.id }}
              search={dc.exclusiveSupplierId ? { supplierId: dc.exclusiveSupplierId } : undefined}
              className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors px-2 py-0.5 rounded border border-primary/20"
            >
              {dc.dcNumber}
            </Link>
            <span className="text-[11px] text-muted-foreground font-medium line-clamp-1 max-w-[200px]">
              {dc.name || dc.dcName}
            </span>
          </div>
        )
      },
    }),

    columnHelper.accessor((row) => row.bacProjectTitle || row.prNumber || '', {
      id: 'prNumber',
      header: 'PR & BAC Project',
      cell: ({ row }) => {
        const title = row.original.bacProjectTitle || row.original.prNumber || '—'
        return (
          <div className="space-y-0.5 max-w-[220px]">
            <p className="text-xs font-medium text-foreground line-clamp-2" title={title}>
              {title}
            </p>
          </div>
        )
      },
    }),

    columnHelper.accessor((row) => row.dcName || row.name || '', {
      id: 'dcName',
      header: 'Item Description',
      cell: ({ row }) => {
        const name = row.original.dcName || row.original.name || '—'
        const itemCount = row.original.items?.length ?? 1
        return (
          <div className="space-y-1 max-w-[240px]">
            <p className="text-xs font-semibold text-foreground line-clamp-2" title={name}>
              {name}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Layers className="h-3 w-3" />
              <span>{itemCount} line item{itemCount === 1 ? '' : 's'}</span>
            </div>
          </div>
        )
      },
    }),

    columnHelper.accessor((row) => row.totalABC, {
      id: 'totalABC',
      header: ({ column }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            className="-mr-3 h-8 data-[state=open]:bg-accent font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>Approved Budget (ABC)</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-3.5 w-3.5 text-primary" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-3.5 w-3.5 text-primary" />
            ) : (
              <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground/60" />
            )}
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const abc = row.original.totalABC
        const proposal = row.original.proposalAmount || row.original.bidTotalAmount || row.original.proposal?.totalProposalAmount
        return (
          <div className="text-right space-y-0.5">
            <span className="text-xs font-bold text-foreground">
              {formatCurrencyPHP(abc)}
            </span>
            {proposal && proposal > 0 ? (
              <p className="text-[11px] text-emerald-600 font-semibold">
                Bid: {formatCurrencyPHP(proposal)}
              </p>
            ) : null}
          </div>
        )
      },
    }),

    columnHelper.accessor((row) => row.submissionDeadline || row.deadline || '', {
      id: 'deadline',
      header: 'Deadline',
      cell: ({ row }) => {
        const deadline = row.original.submissionDeadline || row.original.deadline
        if (!deadline) return <span className="text-muted-foreground text-xs">—</span>
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
            <span>{formatDateV2(deadline)}</span>
          </div>
        )
      },
    }),

    columnHelper.accessor((row) => row.status, {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => renderSupplierStatusBadge(row.original),
    }),

    columnHelper.display({
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const dc = row.original
        const hasProposal = Boolean(dc.proposalAmount || dc.proposal)

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Supplier Actions</DropdownMenuLabel>

                <DropdownMenuItem asChild>
                  <Link
                    to="/v2/supplier-portal/direct-contracting-item/$id"
                    params={{ id: dc.id }}
                    search={dc.exclusiveSupplierId ? { supplierId: dc.exclusiveSupplierId } : undefined}
                    className="flex items-center cursor-pointer text-primary font-medium"
                  >
                    <Eye className="mr-2 h-4 w-4" /> View Full Details
                  </Link>
                </DropdownMenuItem>

                {handlers.onOpenQuotation && (
                  <DropdownMenuItem
                    onClick={() => handlers.onOpenQuotation?.(dc)}
                    className="cursor-pointer"
                  >
                    <Upload className="mr-2 h-4 w-4 text-emerald-600" />
                    {hasProposal ? 'Edit / Review Quotation' : 'Submit Quotation'}
                  </DropdownMenuItem>
                )}

                {handlers.onCopyDCNumber && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handlers.onCopyDCNumber?.(dc.dcNumber)}
                      className="cursor-pointer text-muted-foreground"
                    >
                      <Copy className="mr-2 h-4 w-4" /> Copy Reference No.
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    }),
  ]
}

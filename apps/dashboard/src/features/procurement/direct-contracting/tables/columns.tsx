import { createColumnHelper } from '@tanstack/react-table'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Send,
  Copy,
  CheckCircle,
  AlertCircle,
  FileText,
  FileCheck,
  ShieldCheck,
  ShoppingCart,
  Calendar,
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

import type { DataTableFeatures } from '@/components/ui/table-features'
import type { DirectContractingRecord, TableActionHandlers } from './types'

const columnHelper = createColumnHelper<DataTableFeatures, DirectContractingRecord>()

export function renderStatusBadge(status: string) {
  const normalized = (status || '').toLowerCase()
  switch (normalized) {
    case 'draft':
      return (
        <Badge
          variant="outline"
          className="gap-1.5 font-semibold text-xs bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 py-1 px-2.5"
        >
          <ShoppingCart className="h-3 w-3 text-slate-500" />
          <span>Draft</span>
        </Badge>
      )
    case 'submitted':
      return (
        <Badge
          variant="outline"
          className="gap-1.5 font-semibold text-xs bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 py-1 px-2.5"
        >
          <Send className="h-3 w-3 text-sky-600" />
          <span>Submitted</span>
        </Badge>
      )
    case 'for-review':
    case 'for_review':
    case 'pending-for-approval':
    case 'pending_for_approval':
      return (
        <Badge
          variant="outline"
          className="gap-1.5 font-semibold text-xs bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 py-1 px-2.5"
        >
          <FileCheck className="h-3 w-3 text-amber-600" />
          <span>For Review</span>
        </Badge>
      )
    case 'submitted-to-supplier':
    case 'submitted_to_supplier':
      return (
        <Badge
          variant="outline"
          className="gap-1.5 font-semibold text-xs bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 py-1 px-2.5"
        >
          <CheckCircle className="h-3 w-3 text-purple-600" />
          <span>Sent to Supplier</span>
        </Badge>
      )
    case 'approved':
      return (
        <Badge
          variant="outline"
          className="gap-1.5 font-semibold text-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 py-1 px-2.5"
        >
          <ShieldCheck className="h-3 w-3 text-emerald-600" />
          <span>Approved</span>
        </Badge>
      )
    case 'rejected':
    case 'returned':
      return (
        <Badge
          variant="outline"
          className="gap-1.5 font-semibold text-xs bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 py-1 px-2.5"
        >
          <AlertCircle className="h-3 w-3 text-rose-600" />
          <span>Returned / Rejected</span>
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="capitalize text-xs">
          {status}
        </Badge>
      )
  }
}

export function getDirectContractingColumns(handlers: TableActionHandlers) {
  return columnHelper.columns([
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? 'indeterminate'
                : false
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
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
    }),
    columnHelper.accessor('dcNumber', {
      id: 'dcNumber',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent font-semibold text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Request Details
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-3.5 w-3.5" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-3.5 w-3.5" />
          ) : (
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
          )}
        </Button>
      ),
      filterFn: (row, _columnId, filterValue: string) => {
        if (!filterValue) return true
        const term = filterValue.toLowerCase().trim()
        const dcNumber = (row.original.dcNumber || '').toLowerCase()
        const name = (row.original.name || row.original.dcName || '').toLowerCase()
        const supplier = (
          row.original.supplierName ||
          row.original.exclusiveSupplierName ||
          ''
        ).toLowerCase()
        const bac = (
          row.original.bacProjectTitle ||
          row.original.bacResolutionNumber ||
          ''
        ).toLowerCase()
        return (
          dcNumber.includes(term) ||
          name.includes(term) ||
          supplier.includes(term) ||
          bac.includes(term)
        )
      },
      cell: ({ row }) => {
        const dc = row.original
        return (
          <div className="space-y-1 py-1 max-w-sm sm:max-w-md">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                {dc.dcNumber}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium truncate">
                {dc.category || 'Direct Contracting'}
              </span>
            </div>
            <div
              className="font-medium text-sm text-foreground line-clamp-1 hover:text-primary transition-colors cursor-pointer"
              onClick={() => handlers.onViewProposal(dc)}
              title={dc.name || dc.dcName}
            >
              {dc.name || dc.dcName}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileText className="h-3 w-3 text-muted-foreground/70 shrink-0" />
              <span className="truncate">
                {dc.bacProjectTitle || dc.bacResolutionNumber || 'BAC Project Ref'}
              </span>
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor('supplierName', {
      id: 'supplier',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent font-semibold text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Exclusive Supplier
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-3.5 w-3.5" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-3.5 w-3.5" />
          ) : (
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
          )}
        </Button>
      ),
      cell: ({ row }) => {
        const dc = row.original
        const sName =
          dc.supplierName || dc.exclusiveSupplierName || 'Sole Proprietary Supplier'
        const philGeps = dc.exclusiveSupplierPhilGEPS || 'PhilGEPS Verified'
        return (
          <div className="space-y-1 py-1 max-w-[220px]">
            <div className="font-medium text-sm text-foreground truncate" title={sName}>
              {sName}
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-1.5 py-0.5 rounded">
                PhilGEPS: {philGeps}
              </span>
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor('totalABC', {
      id: 'totalABC',
      header: ({ column }) => (
        <div className="text-right w-full">
          <Button
            variant="ghost"
            size="sm"
            className="-mr-3 h-8 data-[state=open]:bg-accent font-semibold text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Total ABC
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-3.5 w-3.5" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-3.5 w-3.5" />
            ) : (
              <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
            )}
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const amount = row.original.totalABC || 0
        return (
          <div className="text-right font-semibold text-sm tracking-tight text-foreground">
            {formatCurrencyPHP(amount)}
          </div>
        )
      },
    }),
    columnHelper.accessor('submissionDeadline', {
      id: 'deadline',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent font-semibold text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Deadline
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-3.5 w-3.5" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-3.5 w-3.5" />
          ) : (
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
          )}
        </Button>
      ),
      cell: ({ row }) => {
        const deadlineStr = row.original.submissionDeadline || row.original.deadline
        const isPast = deadlineStr ? new Date(deadlineStr) < new Date() : false
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
            <Calendar
              className={cn(
                'h-3.5 w-3.5 shrink-0',
                isPast ? 'text-rose-500' : 'text-muted-foreground',
              )}
            />
            <span className={cn(isPast && 'text-rose-600 font-medium dark:text-rose-400')}>
              {deadlineStr ? formatDateV2(deadlineStr) : '—'}
            </span>
          </div>
        )
      },
    }),
    columnHelper.accessor('status', {
      id: 'status',
      header: 'Status',
      filterFn: (row, _columnId, filterValue: string) => {
        if (!filterValue || filterValue === 'all') return true
        const status = (row.original.status || '').toLowerCase()
        return status === filterValue.toLowerCase()
      },
      cell: ({ row }) => {
        const status = (row.original.status || 'draft').toLowerCase()
        return renderStatusBadge(status)
      },
    }),
    columnHelper.display({
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const dc = row.original
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
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handlers.onCopyDCNumber(dc.dcNumber)}>
                  <Copy className="mr-2 h-4 w-4" /> Copy DC Number
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handlers.onViewProposal(dc)}>
                  <Eye className="mr-2 h-4 w-4 text-primary" /> View Proposal Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlers.onEdit(dc.id)}>
                  <Edit className="mr-2 h-4 w-4 text-muted-foreground" /> Edit Request
                </DropdownMenuItem>
                {dc.status === 'draft' && (
                  <DropdownMenuItem onClick={() => handlers.onPromptSubmit(dc.id)}>
                    <Send className="mr-2 h-4 w-4 text-sky-600" /> Submit for Review
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handlers.onPromptDelete(dc.id)}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Request
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    }),
  ])
}

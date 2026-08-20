/**
 * Admin APRs Table Column Definitions
 * Columns: APR Number, Office, Status, Request Date, Total Amount, Items, Actions
 */

import { createColumnHelper } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Eye, Check, RotateCcw } from 'lucide-react'
import { APRStatusBadge } from '../components/APRStatusBadge'
import { normalizeAPRStatus } from '../utils'

const columnHelper = createColumnHelper<any>()

interface AdminAPRsTableColumnsProps {
  onView: (apr: any) => void
  onApprove: (apr: any) => void
  onReturn: (apr: any) => void
}

export function getAdminAPRsTableColumns({
  onView,
  onApprove,
  onReturn,
}: AdminAPRsTableColumnsProps) {
  return [
    columnHelper.accessor('aprNumber', {
      id: 'aprNumber',
      header: 'APR Number',
      enableSorting: true,
      cell: (info) => (
        <span
          className="font-medium text-blue-600 cursor-pointer hover:underline"
          onClick={() => onView(info.row.original)}
        >
          {info.getValue() || '—'}
        </span>
      ),
    }),

    columnHelper.accessor((row) => row.officeName || row.requestingEntity || '', {
      id: 'office',
      header: 'Office / Entity',
      enableSorting: true,
      cell: (info) => <span className="text-sm">{info.getValue() || '—'}</span>,
    }),

    columnHelper.accessor('totalAmount', {
      id: 'totalAmount',
      header: 'Total Amount',
      enableSorting: true,
      cell: (info) => (
        <span className="font-medium">
          ₱{new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(info.getValue() || 0)}
        </span>
      ),
    }),

    columnHelper.accessor('requestDate', {
      id: 'requestDate',
      header: 'Request Date',
      enableSorting: true,
      cell: (info) => {
        const val = info.getValue()
        if (!val) return '—'
        try {
          return format(new Date(val), 'MMM dd, yyyy')
        } catch {
          return val
        }
      },
    }),

    columnHelper.accessor('status', {
      id: 'status',
      header: 'Status',
      enableSorting: true,
      cell: (info) => {
        return <APRStatusBadge status={info.getValue() || 'Draft'} context="procurement_officer" />
      },
    }),

    columnHelper.accessor((row) => row.itemCount ?? row.totalItemsCount ?? row.items?.length ?? 0, {
      id: 'items',
      header: 'Items',
      enableSorting: true,
      cell: (info) => (
        <span className="text-center">{info.getValue()} items</span>
      ),
    }),

    columnHelper.accessor('id', {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: (info) => {
        const apr = info.row.original
        const status = normalizeAPRStatus(apr.status)
        const canApprove = status === 'FOR_APPROVAL'
        const canReturn = status === 'FOR_APPROVAL' || status === 'DRAFT'

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="Open menu"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(apr)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>

              {canApprove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onApprove(apr)}>
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    Approve
                  </DropdownMenuItem>
                </>
              )}

              {canReturn && (
                <DropdownMenuItem onClick={() => onReturn(apr)}>
                  <RotateCcw className="mr-2 h-4 w-4 text-amber-600" />
                  Return for Revision
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }),
  ]
}

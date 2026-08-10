/**
 * Admin APRs Table Column Definitions
 * Columns: APR Number, Office, Status, Request Date, Total Amount, Submitted By, Actions
 */

import { createColumnHelper } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Eye, Check, RotateCcw } from 'lucide-react'
import type { APRMaster, APRStatus } from '../types'

const columnHelper = createColumnHelper<APRMaster>()

// Status badge variants
const statusVariants: Record<APRStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  FOR_APPROVAL: 'bg-blue-100 text-blue-800',
  RETURNED: 'bg-red-100 text-red-800',
  APPROVED: 'bg-green-100 text-green-800',
  PARTIALLY_AVAILABLE: 'bg-yellow-100 text-yellow-800',
  OUT_OF_STOCK: 'bg-orange-100 text-orange-800',
}

interface AdminAPRsTableColumnsProps {
  onView: (apr: APRMaster) => void
  onApprove: (apr: APRMaster) => void
  onReturn: (apr: APRMaster) => void
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
        <span className="font-medium text-blue-600">{info.getValue()}</span>
      ),
    }),

    columnHelper.accessor('requestingEntity', {
      id: 'office',
      header: 'Office / Entity',
      enableSorting: true,
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),

    columnHelper.accessor('requestedBy', {
      id: 'requestedBy',
      header: 'Submitted By',
      enableSorting: true,
      cell: (info) => (
        <span className="text-sm">
          {info.getValue()}
          <br />
          <span className="text-xs text-gray-500">
            {info.row.original.requestedByPosition}
          </span>
        </span>
      ),
    }),

    columnHelper.accessor('totalAmount', {
      id: 'totalAmount',
      header: 'Total Amount',
      enableSorting: true,
      cell: (info) => (
        <span className="font-medium">
          ₱{new Intl.NumberFormat('en-PH').format(info.getValue())}
        </span>
      ),
    }),

    columnHelper.accessor('requestDate', {
      id: 'requestDate',
      header: 'Request Date',
      enableSorting: true,
      cell: (info) =>
        format(new Date(info.getValue()), 'MMM dd, yyyy'),
    }),

    columnHelper.accessor('status', {
      id: 'status',
      header: 'Status',
      enableSorting: true,
      cell: (info) => (
        <Badge className={statusVariants[info.getValue()]}>
          {info.getValue().replace(/_/g, ' ')}
        </Badge>
      ),
    }),

    columnHelper.accessor('totalItemsCount', {
      id: 'items',
      header: 'Items',
      enableSorting: true,
      cell: (info) => (
        <span className="text-center">{info.getValue()} items</span>
      ),
    }),

    columnHelper.accessor('status', {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: (info) => {
        const apr = info.row.original
        const canApprove = apr.status === 'FOR_APPROVAL'
        const canReturn = apr.status === 'FOR_APPROVAL' || apr.status === 'DRAFT'

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

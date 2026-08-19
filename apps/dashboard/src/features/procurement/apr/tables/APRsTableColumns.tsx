/**
 * APRs Table Column Definitions
 * Columns: APR Number, Office, Items, Total Amount, Request Date, Status, Actions
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
import { MoreVertical, Eye, Trash2 } from 'lucide-react'
import type { APRListItemDto } from '../types'
import { APRStatusBadge } from '../components/APRStatusBadge'

const columnHelper = createColumnHelper<APRListItemDto | any>()

// Status badge variants
const statusVariants: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-800 border-gray-300',
  DRAFT: 'bg-gray-100 text-gray-800 border-gray-300',
  ForApproval: 'bg-blue-100 text-blue-800 border-blue-300',
  FOR_APPROVAL: 'bg-blue-100 text-blue-800 border-blue-300',
  Submitted: 'bg-blue-100 text-blue-800 border-blue-300',
  SUBMITTED: 'bg-blue-100 text-blue-800 border-blue-300',
  Returned: 'bg-red-100 text-red-800 border-red-300',
  RETURNED: 'bg-red-100 text-red-800 border-red-300',
  Approved: 'bg-green-100 text-green-800 border-green-300',
  APPROVED: 'bg-green-100 text-green-800 border-green-300',
  PartiallyAvailable: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  PARTIALLY_AVAILABLE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  OutOfStock: 'bg-orange-100 text-orange-800 border-orange-300',
  OUT_OF_STOCK: 'bg-orange-100 text-orange-800 border-orange-300',
}

interface ColumnsProps {
  onView: (apr: any) => void
  onDelete: (apr: any) => void
}

export function getAPRsTableColumns({ onView, onDelete }: ColumnsProps) {
  return [
    columnHelper.accessor('aprNumber', {
      id: 'aprNumber',
      header: 'APR Number',
      cell: (info) => (
        <span className="font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => onView(info.row.original)}>
          {info.getValue() || '—'}
        </span>
      ),
    }),

    columnHelper.accessor((row) => row.officeName || row.requestingEntity || '', {
      id: 'office',
      header: 'Office',
      cell: (info) => <span className="text-sm">{info.getValue() || '—'}</span>,
    }),

    columnHelper.accessor((row) => row.itemCount ?? row.totalItemsCount ?? row.items?.length ?? 0, {
      id: 'items',
      header: 'Items',
      cell: (info) => (
        <span className="text-center">{info.getValue()} items</span>
      ),
    }),

    columnHelper.accessor('totalAmount', {
      id: 'totalAmount',
      header: 'Total Amount',
      cell: (info) => (
        <span className="font-medium">
          ₱{new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(info.getValue() || 0)}
        </span>
      ),
    }),

    columnHelper.accessor('requestDate', {
      id: 'requestDate',
      header: 'Request Date',
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
      cell: (info) => {
        return <APRStatusBadge status={info.getValue() || 'Draft'} context="user" />
      },
    }),

    columnHelper.accessor('id', {
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const apr = info.row.original
        const status = (apr.status || '').toLowerCase()
        const isDraft = status === 'draft'

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
              {isDraft && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(apr)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }),
  ]
}

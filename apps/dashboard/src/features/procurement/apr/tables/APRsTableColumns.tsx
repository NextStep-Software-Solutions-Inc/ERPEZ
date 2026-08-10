/**
 * APRs Table Column Definitions
 * Columns: APR Number, Status, Request Date, Total Amount, Items Count, Actions
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

interface ColumnsProps {
  onView: (apr: APRMaster) => void
  onDelete: (apr: APRMaster) => void
}

export function getAPRsTableColumns({ onView, onDelete }: ColumnsProps) {
  return [
    columnHelper.accessor('aprNumber', {
      id: 'aprNumber',
      header: 'APR Number',
      cell: (info) => (
        <span className="font-medium text-blue-600">{info.getValue()}</span>
      ),
    }),

    columnHelper.accessor('totalItemsCount', {
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
        <span>
          ₱{new Intl.NumberFormat('en-PH').format(info.getValue())}
        </span>
      ),
    }),

    columnHelper.accessor('requestDate', {
      id: 'requestDate',
      header: 'Request Date',
      cell: (info) =>
        format(new Date(info.getValue()), 'MMM dd, yyyy'),
    }),

    columnHelper.accessor('status', {
      id: 'status',
      header: 'Status',
      cell: (info) => (
        <Badge className={statusVariants[info.getValue()]}>
          {info.getValue().replace(/_/g, ' ')}
        </Badge>
      ),
    }),

    columnHelper.accessor('status', {
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const apr = info.row.original
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
              {apr.status === 'DRAFT' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(apr)}
                    className="text-red-600"
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

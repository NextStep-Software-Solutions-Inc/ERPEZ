/**
 * APRs Table Column Definitions
 * Columns: APR Number, Office, Items, Total Amount, Request Date, Status, Actions
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
import { MoreVertical, Eye, Trash2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { generateAndDownloadAprDocument } from '../handlers/generateAprDocumentRequest'
import type { APRListItemDto } from '../types'
import { APRStatusBadge } from '../components/APRStatusBadge'

const columnHelper = createColumnHelper<APRListItemDto | any>()

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
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    toast.loading('Generating APR Form No. 002 PDF...', { id: `export-apr-${apr.id}` })
                    await generateAndDownloadAprDocument({
                      aprId: apr.id,
                      format: 'Pdf',
                      filename: `APR_${apr.aprNumber || apr.id}.pdf`
                    })
                    toast.success('APR Form No. 002 PDF downloaded', { id: `export-apr-${apr.id}` })
                  } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : 'Failed to export APR PDF'
                    toast.error(msg, { id: `export-apr-${apr.id}` })
                  }
                }}
              >
                <Download className="mr-2 h-4 w-4 text-blue-600" />
                Export Form 002 (PDF)
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

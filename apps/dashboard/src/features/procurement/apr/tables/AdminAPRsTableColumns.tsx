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
import { MoreVertical, Eye, Check, RotateCcw, Download } from 'lucide-react'
import { toast } from 'sonner'
import { generateAndDownloadAprDocument } from '../handlers/generateAprDocumentRequest'
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
          className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer hover:underline transition-colors"
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
      cell: (info) => <span className="text-sm text-foreground">{info.getValue() || '—'}</span>,
    }),

    columnHelper.accessor('totalAmount', {
      id: 'totalAmount',
      header: 'Total Amount',
      enableSorting: true,
      cell: (info) => (
        <span className="font-semibold text-foreground tabular-nums">
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
        if (!val) return <span className="text-muted-foreground">—</span>
        try {
          return <span className="text-muted-foreground">{format(new Date(val), 'MMM dd, yyyy')}</span>
        } catch {
          return <span className="text-muted-foreground">{val}</span>
        }
      },
    }),

    columnHelper.accessor('status', {
      id: 'status',
      header: 'Status',
      enableSorting: true,
      cell: (info) => {
        return <APRStatusBadge status={info.getValue() || 'Draft'} context="procurement_officer" size="sm" />
      },
    }),

    columnHelper.accessor((row) => row.itemCount ?? row.totalItemsCount ?? row.items?.length ?? 0, {
      id: 'items',
      header: 'Items',
      enableSorting: true,
      cell: (info) => (
        <span className="text-center text-muted-foreground tabular-nums">{info.getValue()} items</span>
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
                <Download className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                Export Form 002 (PDF)
              </DropdownMenuItem>

              {canApprove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onApprove(apr)}>
                    <Check className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Approve
                  </DropdownMenuItem>
                </>
              )}

              {canReturn && (
                <DropdownMenuItem onClick={() => onReturn(apr)}>
                  <RotateCcw className="mr-2 h-4 w-4 text-amber-600 dark:text-amber-400" />
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

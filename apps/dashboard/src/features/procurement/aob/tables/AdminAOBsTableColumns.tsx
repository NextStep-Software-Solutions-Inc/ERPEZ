/**
 * Admin AOBs Table Columns Definition
 * Defines columns for the admin AOB management table with view/approve/return actions
 */

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, CheckCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import type { AOB } from '../types'
import { AOBStatus } from '../types/aobTypes'

type BadgeVariant = 'outline' | 'soft'

const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  Draft: { label: 'Draft', variant: 'soft' },
  'For Approval': { label: 'For Approval', variant: 'outline' },
  Approved: { label: 'Approved', variant: 'soft' },
  Rejected: { label: 'Rejected', variant: 'soft' },
  Cancelled: { label: 'Cancelled', variant: 'outline' },
}

export function getAdminAOBsTableColumns({
  onView,
  onApprove,
  onReturn,
}: {
  onView: (aob: AOB) => void
  onApprove: (aob: AOB) => void
  onReturn: (aob: AOB) => void
}): ColumnDef<AOB>[] {
  return [
    {
      accessorKey: 'aobNumber',
      header: 'AOB Number',
      cell: ({ row }) => <span className="font-medium">{row.getValue('aobNumber')}</span>,
    },
    {
      accessorKey: 'rfqNumber',
      header: 'RFQ Reference',
      cell: ({ row }) => <span className="text-sm">{row.getValue('rfqNumber') || '—'}</span>,
    },
    {
      accessorKey: 'awardCriterion',
      header: 'Award Criterion',
      cell: ({ row }) => {
        const criterion = row.getValue('awardCriterion') as string
        return <span className="text-sm">{criterion}</span>
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const config = statusConfig[status] || { label: status, variant: 'default' }
        return <Badge variant={config.variant}>{config.label}</Badge>
      },
    },
    {
      accessorKey: 'date',
      header: 'Created',
      cell: ({ row }) => {
        const date = row.getValue('date') as string
        return <span className="text-sm">{format(new Date(date), 'MMM d, yyyy')}</span>
      },
    },
    {
      accessorKey: 'createdBy',
      header: 'Created By',
      cell: ({ row }) => <span className="text-sm">{row.getValue('createdBy')}</span>,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const aob = row.original
        const isForApproval = aob.status === AOBStatus.FOR_APPROVAL
        const canApprove = isForApproval

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(aob)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>

              {canApprove && (
                <DropdownMenuItem onClick={() => onApprove(aob)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>
              )}

              {isForApproval && (
                <DropdownMenuItem onClick={() => onReturn(aob)}>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Return
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

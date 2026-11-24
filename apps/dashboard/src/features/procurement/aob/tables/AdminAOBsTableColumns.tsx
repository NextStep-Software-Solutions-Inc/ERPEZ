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

const statusConfig: Record<string, { label: string; variant: BadgeVariant; className?: string }> = {
  Draft: { label: 'Draft', variant: 'outline', className: 'bg-slate-100 text-slate-700 border-slate-300' },
  ForApproval: { label: 'For Approval', variant: 'outline', className: 'bg-amber-50 text-amber-800 border-amber-300' },
  'For Approval': { label: 'For Approval', variant: 'outline', className: 'bg-amber-50 text-amber-800 border-amber-300' },
  Submitted: { label: 'For Approval', variant: 'outline', className: 'bg-amber-50 text-amber-800 border-amber-300' },
  Approved: { label: 'Approved', variant: 'outline', className: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  Rejected: { label: 'Returned', variant: 'outline', className: 'bg-rose-50 text-rose-800 border-rose-300' },
  Returned: { label: 'Returned', variant: 'outline', className: 'bg-rose-50 text-rose-800 border-rose-300' },
  Cancelled: { label: 'Cancelled', variant: 'outline', className: 'bg-gray-100 text-gray-700 border-gray-300' },
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
      cell: ({ row }) => (
        <span className="font-semibold text-sm text-blue-600 cursor-pointer hover:underline">
          {row.getValue('aobNumber')}
        </span>
      ),
    },
    {
      accessorKey: 'rfqNumber',
      header: 'RFQ Reference',
      cell: ({ row }) => {
        const val = row.getValue('rfqNumber') as string | undefined
        const raw = row.original as any
        const displayValue =
          val ||
          raw.rfqNumber ||
          (Array.isArray(raw.rfqNumbers) && raw.rfqNumbers.length > 0
            ? raw.rfqNumbers.filter(Boolean).join(', ')
            : '') ||
          (Array.isArray(raw.rfqs) && raw.rfqs.length > 0
            ? raw.rfqs.map((r: any) => r.rfqNumber).filter(Boolean).join(', ')
            : '') ||
          '—'
        return <span className="text-sm">{displayValue}</span>
      },
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
        const rawStatus = row.getValue('status') as string
        const config = statusConfig[rawStatus] || {
          label: rawStatus === 'ForApproval' ? 'For Approval' : rawStatus,
          variant: 'outline' as BadgeVariant,
          className: 'bg-amber-50 text-amber-800 border-amber-300',
        }
        return (
          <Badge variant={config.variant} className={config.className || ''}>
            {config.label}
          </Badge>
        )
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

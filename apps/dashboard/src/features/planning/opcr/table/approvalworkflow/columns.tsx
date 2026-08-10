'use client'

import { ColumnDef } from '@tanstack/react-table'
import {
  MoreHorizontal,
  CheckCircle,
  Circle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CommitmentStatus, OPCR } from '../../types'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

export interface ApprovalWorkflowTableMeta {
  onViewDetails?: (opcr: OPCR) => void | Promise<void>
  onApprove?: (opcr: OPCR) => void | Promise<void>
  onReturn?: (opcr: OPCR) => void | Promise<void>
  onGenerate?: (opcr: OPCR) => void | Promise<void>
  onDraft?: (opcr: OPCR) => void | Promise<void>
  isUpdating?: boolean
}

// ─── Utility Functions ───────────────────────────────────────────────
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'
  try {
    return format(new Date(dateString), 'MMM dd, yyyy')
  } catch {
    return 'N/A'
  }
}

const getStatusIcon = (status: CommitmentStatus | null | undefined) => {
  const statusLower = status?.toLowerCase()
  const iconProps = { className: 'h-3.5 w-3.5 inline mr-1' }

  switch (statusLower) {
    case 'approved':
      return <CheckCircle {...iconProps} />
    case 'returned':
      return <AlertCircle {...iconProps} />
    case 'submitted':
    case 'draft':
      return <Circle {...iconProps} />
    default:
      return null
  }
}

const getStatusColor = (
  status: CommitmentStatus | null | undefined,
): string => {
  const statusLower = status?.toLowerCase()
  const colorMap: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    submitted: 'bg-blue-100 text-blue-700 border-blue-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    returned: 'bg-red-100 text-red-700 border-red-200',
  }
  return colorMap[statusLower || ''] || 'bg-gray-100 text-gray-700'
}

const getStatusLabel = (
  status: CommitmentStatus | null | undefined,
): string => {
  const labelMap: Record<string, string> = {
    draft: 'DRAFT',
    submitted: 'SUBMITTED',
    approved: 'APPROVED',
    returned: 'RETURNED',
  }
  return labelMap[status?.toLowerCase() || ''] || status || 'UNKNOWN'
}

const getPriorityColor = (priority: string): string => {
  const colorMap: Record<string, string> = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-gray-100 text-gray-700 border-gray-200',
  }
  return colorMap[priority.toLowerCase()] || 'bg-gray-100 text-gray-700'
}

const calculatePriority = (kpiCount: number): string => {
  if (kpiCount > 5) return 'HIGH'
  if (kpiCount > 2) return 'MEDIUM'
  return 'LOW'
}

const calculateDueDate = (submittedDate: string | null | undefined): string => {
  if (!submittedDate) {
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 1)
    return formatDate(futureDate.toISOString())
  }
  const date = new Date(submittedDate)
  date.setMonth(date.getMonth() + 1)
  return formatDate(date.toISOString())
}

// ─── Column Definitions ──────────────────────────────────────────────
export const columns: ColumnDef<OPCR>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'OPCR Name',
    cell: ({ row }) => {
      const opcr = row.original
      const kpiCount =
        opcr.kpiAssignmentCount ?? opcr.dukpiTargetAssignments?.length ?? 0
      const activityCount =
        opcr.activityCount ?? opcr.opcrActivities?.length ?? 0
      return (
        <div className="flex flex-col gap-1">
          <span className="font-medium text-sm">{opcr.name}</span>
          <span className="text-xs text-gray-500">
            {kpiCount} KPI{kpiCount !== 1 ? 's' : ''} + {activityCount} Activit
            {activityCount !== 1 ? 'ies' : 'y'}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'commitmentStatus',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.commitmentStatus
      const colorClass = getStatusColor(status as CommitmentStatus)
      return (
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colorClass}`}
        >
          {getStatusIcon(status as CommitmentStatus)}
          {getStatusLabel(status as CommitmentStatus)}
        </div>
      )
    },
  },
  {
    id: 'submittedBy',
    header: 'Submitted By',
    cell: ({ row }) => {
      const submittedDate = row.original.submittedDate
      return (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-blue-600">-</span>
          <span className="text-xs text-gray-500">
            {submittedDate ? formatDate(submittedDate) : 'Not submitted'}
          </span>
        </div>
      )
    },
  },
  {
    id: 'priority',
    header: 'Priority',
    cell: ({ row }) => {
      const kpiCount =
        row.original.kpiAssignmentCount ??
        row.original.dukpiTargetAssignments?.length ??
        0
      const priority = calculatePriority(kpiCount)
      const priorityKey = priority.toLowerCase()
      const colorClass = getPriorityColor(priorityKey)
      return (
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colorClass}`}
        >
          {priority}
        </div>
      )
    },
  },
  {
    id: 'dueDate',
    header: 'Due Date',
    cell: ({ row }) => {
      return (
        <span className="text-sm">
          {calculateDueDate(row.original.submittedDate)}
        </span>
      )
    },
  },
  {
    accessorKey: 'totalBudget',
    header: 'Total Budget',
    cell: ({ row }) => {
      return (
        <span className="text-sm font-medium">
          {formatCurrency(row.original.totalBudget)}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const opcr = row.original
      const meta = table.options.meta as ApprovalWorkflowTableMeta | undefined
      const isUpdating = meta?.isUpdating ?? false
      const status = opcr.commitmentStatus?.toLowerCase()

      const handleViewDetails = async () => {
        try {
          await meta?.onViewDetails?.(opcr)
        } catch (error) {
          toast.error('Failed to view details')
        }
      }

      const handleApprove = async () => {
        try {
          await meta?.onApprove?.(opcr)
        } catch (error) {
          toast.error('Failed to approve OPCR')
        }
      }

      const handleReturn = async () => {
        try {
          await meta?.onReturn?.(opcr)
        } catch (error) {
          toast.error('Failed to return OPCR')
        }
      }

      const handleGenerate = async () => {
        try {
          await meta?.onGenerate?.(opcr)
        } catch (error) {
          toast.error('Failed to generate OPCR')
        }
      }

      const handleDraft = async () => {
        try {
          await meta?.onDraft?.(opcr)
        } catch (error) {
          toast.error('Failed to draft OPCR')
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              disabled={isUpdating}
            >
              <span className="sr-only">Open menu</span>
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreHorizontal className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleViewDetails} disabled={isUpdating}>
              View Details
            </DropdownMenuItem>
            {status === 'submitted' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleApprove} disabled={isUpdating}>
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleReturn} disabled={isUpdating}>
                  Return
                </DropdownMenuItem>
              </>
            )}
            {status === 'draft' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleGenerate}
                  disabled={isUpdating}
                >
                  Generate
                </DropdownMenuItem>
              </>
            )}
            {status === '' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDraft} disabled={isUpdating}>
                  Draft
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

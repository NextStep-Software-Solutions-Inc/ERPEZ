import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { ApprovalWorkflowActions } from './ApprovalWorkflowActions'

export interface ApprovalWorkflow {
  id: string
  opcrName: string
  officeName: string
  fiscalYear: number
  status: 'draft' | 'submitted' | 'approved' | 'returned'
  submittedDate: string
  totalBudget: number
  kpiCount: number
  activityCount: number
  submittedBy: string
  approver: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  kpis: any[]
}

export const Column: ColumnDef<ApprovalWorkflow>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
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
    accessorKey: 'opcrName',
    header: 'OPCR Name',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue('opcrName')}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.kpiCount} KPIs • {row.original.activityCount} Activities
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const getStatusIcon = (status: string) => {
        switch (status) {
          case 'approved':
            return <CheckCircle className="h-4 w-4 text-green-500" />
          case 'draft':
            return <Clock className="h-4 w-4 text-gray-500" />
          case 'submitted':
            return <Clock className="h-4 w-4 text-blue-500" />
          case 'returned':
            return <XCircle className="h-4 w-4 text-red-500" />
          default:
            return <Clock className="h-4 w-4 text-gray-500" />
        }
      }

      const getStatusBadge = (status: string) => {
        const statusStyles: Record<string, string> = {
          approved: 'bg-green-100 text-green-800',
          draft: 'bg-gray-100 text-gray-800',
          submitted: 'bg-blue-100 text-blue-800',
          returned: 'bg-red-100 text-red-800',
        }
        return (
          <Badge
            className={statusStyles[status] || 'bg-gray-100 text-gray-800'}
          >
            {status.replace('_', ' ').toUpperCase()}
          </Badge>
        )
      }

      return (
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          {getStatusBadge(status)}
        </div>
      )
    },
  },
  {
    accessorKey: 'submittedBy',
    header: 'Submitted By',
    cell: ({ row }) => (
      <div className="text-sm">
        {row.getValue('submittedBy')}
        <div className="text-muted-foreground">
          {new Date(row.original.submittedDate).toLocaleDateString()}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => {
      const priority = row.getValue('priority') as string
      const colors: Record<string, string> = {
        high: 'bg-red-100 text-red-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-green-100 text-green-800',
      }
      return (
        <Badge className={colors[priority] || 'bg-gray-100 text-gray-800'}>
          {priority.toUpperCase()}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    cell: ({ row }) => (
      <div className="text-sm">
        {new Date(row.getValue('dueDate')).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: 'totalBudget',
    header: 'Total Budget',
    cell: ({ row }) => (
      <div className="text-sm font-medium">
        ₱{row.getValue<number>('totalBudget').toLocaleString()}
      </div>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      const workflow = row.original
      const meta = table.options.meta as any
      return (
        <ApprovalWorkflowActions
          workflow={workflow}
          onView={meta?.onView}
          onGenerate={meta?.onGenerate}
        />
      )
    },
  },
]

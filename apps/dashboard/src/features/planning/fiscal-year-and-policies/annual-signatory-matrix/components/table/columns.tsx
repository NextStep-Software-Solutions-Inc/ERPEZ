import { ColumnDef } from '@tanstack/react-table'
// import { Checkbox } from '@/components/ui/checkbox'
import type { User } from '@/lib/fiscal-year-and-policies/types'
import { ActionCell } from './ActionCell'
import { InlineEditableApproverCell } from './InlineEditableApproverCell'
import { InlineEditableDepartmentCell } from './InlineEditableDepartmentCell'
import { WorkflowMatrix } from '../../types/workflowMatrixTypes'

interface ColumnsContextProps {
  availableUsers?: User[]
  onSuccess?: () => void
}

/**
 * Create column definitions with context props
 * This pattern allows us to pass context to cells without using hooks in column definitions
 * Follows React best practices by keeping hooks at component level only
 */
export const createColumns = ({
  availableUsers = [],
  onSuccess,
}: ColumnsContextProps): ColumnDef<WorkflowMatrix>[] => [
  {
    accessorKey: 'officeName',
    header: 'Office',
    cell: (info) => {
      const item = info.row.original
      return <InlineEditableDepartmentCell item={item} />
    },
    enableSorting: true,
    enableColumnFilter: true,
  },

  // Recommending Approval column (Inline Editable)
  {
    accessorKey: 'recommendingApprover.currentUser.name',
    header: 'Recommending Approval',
    cell: (info) => {
      const item = info.row.original
      const approverName = info.getValue() as string | null

      return (
        <InlineEditableApproverCell
          item={item}
          approverRole="recommending"
          approverName={approverName}
          approverId={item.recommendingApprover.currentUser.id}
          availableUsers={availableUsers}
          onSuccess={onSuccess}
        />
      )
    },
    enableSorting: true,
  },

  // Final Approval column (Inline Editable)
  {
    accessorKey: 'finalApprover.currentUser.name',
    header: 'Final Approval',
    cell: (info) => {
      const item = info.row.original
      const approverName = info.getValue() as string | null

      return (
        <InlineEditableApproverCell
          item={item}
          approverRole="final"
          approverName={approverName}
          approverId={item.finalApprover.currentUser.id}
          availableUsers={availableUsers}
          onSuccess={onSuccess}
        />
      )
    },
    enableSorting: true,
  },

  // Actions column
  {
    id: 'actions',
    header: 'Actions',
    cell: (info) => {
      const item = info.row.original

      return <ActionCell item={item} onSuccess={onSuccess} />
    },
    enableSorting: false,
    enableHiding: false,
  },
]

/**
 * Backward compatibility export with default empty context
 * @deprecated Use createColumns() instead to pass context props
 */
export const columns = createColumns({
  availableUsers: [],
})

import type { ColumnDef } from '@tanstack/react-table'
import type { OfficeCategoryEntity } from '@/components/features/planning/organizational-structure/types'
import type { MetaActions } from '@/types/global'
import { Badge } from '@/components/ui/badge'
import { formatRelativeDate } from '@/utils/formatters'
import { createSettingsActionsColumn } from './createSettingsActionsColumn'

interface CreateOfficeCategoryColumnsProps {
  actions: MetaActions
  onEdit: (data: OfficeCategoryEntity) => void
  onDelete: (data: OfficeCategoryEntity) => void
}

export const createOfficeCategoryColumns = ({
  actions,
  onEdit,
  onDelete,
}: CreateOfficeCategoryColumnsProps): ColumnDef<OfficeCategoryEntity>[] => [
  {
    accessorKey: 'name',
    header: 'Category Name',
    cell: ({ row }) => (
      <div className="font-semibold text-default-900">{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => (
      <div className="font-mono text-xs font-semibold text-primary bg-primary/5 px-2 py-1 rounded w-fit">
        {row.getValue('code')}
      </div>
    ),
  },
  {
    accessorKey: 'canHaveChildren',
    header: 'Can Have Children',
    cell: ({ row }) => (
      <Badge variant="soft" color={row.getValue('canHaveChildren') ? 'success' : 'warning'} className="text-[10px] font-semibold uppercase">
        {row.getValue('canHaveChildren') ? 'Yes' : 'No'}
      </Badge>
    ),
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean
      return (
        <Badge variant="soft" color={isActive ? 'success' : 'warning'} className="text-[10px] font-semibold uppercase">
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => (
      <div className="text-sm text-default-500 whitespace-nowrap">
        {formatRelativeDate((row.original as any).createdAt)}
      </div>
    ),
  },
  // Actions column - uses factory function for consistency
  createSettingsActionsColumn(actions, onEdit, onDelete),
]

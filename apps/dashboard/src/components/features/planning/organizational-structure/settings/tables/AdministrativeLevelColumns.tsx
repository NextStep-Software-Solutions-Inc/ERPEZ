import type { ColumnDef } from '@tanstack/react-table'
import type { AdministrativeLevel } from '@/components/features/planning/organizational-structure/types'
import type { MetaActions } from '@/types/global'
import { Badge } from '@/components/ui/badge'
import { formatRelativeDate } from '@/utils/formatters'
import { createSettingsActionsColumn } from './createSettingsActionsColumn'
import { CheckIcon, XIcon } from 'lucide-react'

interface CreateAdministrativeLevelColumnsProps {
  actions: MetaActions
  onEdit: (data: AdministrativeLevel) => void
  onDelete: (data: AdministrativeLevel) => void
}

export const createAdministrativeLevelColumns = ({
  actions,
  onEdit,
  onDelete,
}: CreateAdministrativeLevelColumnsProps): ColumnDef<AdministrativeLevel>[] => [
  {
    accessorKey: 'name',
    header: 'Level Name',
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
    cell: ({ row }) => {
      const canHaveChildren = row.getValue('canHaveChildren') as boolean
      return (
        <div className="flex items-center">
          {canHaveChildren ? (
            <CheckIcon className="h-4 w-4 text-green-600" />
          ) : (
            <XIcon className="h-4 w-4 text-red-600" />
          )}
          <span className="ml-2 text-sm">{canHaveChildren ? 'Yes' : 'No'}</span>
        </div>
      )
    },
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
    accessorKey: 'createdBy',
    header: 'Created By',
    cell: ({ row }) => (
      <div className="text-sm text-default-600">
        {(row.getValue('createdBy') as string) || <span className="text-default-400 italic">Unknown</span>}
      </div>
    ),
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

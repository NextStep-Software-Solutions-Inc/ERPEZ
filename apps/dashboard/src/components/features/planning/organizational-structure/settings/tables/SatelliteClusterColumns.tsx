import type { ColumnDef } from '@tanstack/react-table'
import type { SatelliteClusterSetting } from '@/components/features/planning/organizational-structure/types'
import type { MetaActions } from '@/types/global'
import { Badge } from '@/components/ui/badge'
import { formatRelativeDate } from '@/utils/formatters'
import { createSettingsActionsColumn } from './createSettingsActionsColumn'

interface CreateSatelliteClusterColumnsProps {
  actions: MetaActions
  onEdit: (data: SatelliteClusterSetting) => void
  onDelete: (data: SatelliteClusterSetting) => void
}

export const createSatelliteClusterColumns = ({
  actions,
  onEdit,
  onDelete,
}: CreateSatelliteClusterColumnsProps): ColumnDef<SatelliteClusterSetting>[] => [
  {
    accessorKey: 'name',
    header: 'Cluster Name',
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
    accessorKey: 'address',
    header: 'Address',
    cell: ({ row }) => (
      <div className="text-sm text-default-600">
        {row.getValue('address')}
      </div>
    ),
  },
  {
    accessorKey: 'maxSubUnits',
    header: 'Max Sub-Units',
    cell: ({ row }) => (
      <Badge variant="soft" className="text-[10px]">
        Max {row.getValue('maxSubUnits')} units
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

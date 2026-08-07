import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { UNSPSCodeActions } from '../dialog/UNSPSCodeActions'
import type { UNSPSCode } from '../../../types'
import type { MetaActions } from '@/types/global'

interface Handlers {
  onEdit: (item: UNSPSCode) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
  actions?: MetaActions
}

export const getUNSPSCodeColumns = (handlers: Handlers): ColumnDef<UNSPSCode>[] => [
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
    accessorKey: 'Key',
    header: 'Key',
    cell: ({ row }) => <span className="text-sm">{row.getValue('Key')}</span>,
  },
  {
    accessorKey: 'ParentName',
    header: 'Parent Name',
    cell: ({ row }) => {
      const parentName = row.getValue('ParentName') as string
      return <span className="text-sm">{parentName || '-'}</span>
    },
  },
  {
    accessorKey: 'Name',
    header: 'Name',
    cell: ({ row }) => <span className="font-medium">{row.getValue('Name')}</span>,
  },
  {
    accessorKey: 'Code',
    header: 'Code',
    cell: ({ row }) => <code className="text-sm">{row.getValue('Code')}</code>,
  },
  {
    accessorKey: 'Level',
    header: 'Level',
    cell: ({ row }) => <span className="text-sm">{row.getValue('Level')}</span>,
  },
  {
    accessorKey: 'IsActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('IsActive') as boolean
      return (
        <Badge color={isActive ? 'success' : 'warning'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const unspscCode = row.original
      return (
        <UNSPSCodeActions
          row={unspscCode}
          actions={handlers.actions ?? ['read']}
          onEdit={() => handlers.onEdit(unspscCode)}
          onDelete={() => handlers.onDelete(unspscCode.id)}
          onToggleStatus={() => handlers.onToggleStatus(unspscCode.id)}
        />
      )
    },
  },
]
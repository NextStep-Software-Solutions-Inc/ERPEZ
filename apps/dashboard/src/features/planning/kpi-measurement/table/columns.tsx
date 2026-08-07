import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import type { KpiWithIndicators } from '../types'

export const columns: ColumnDef<KpiWithIndicators>[] = [
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
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.getValue('code')}
      </Badge>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      const description = row.original.description || ''
      return (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{name}</span>
          {description && (
            <span className="text-xs text-gray-600">{description}</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'operationalDefinition',
    header: 'Operational Definition',
    cell: ({ row }) => {
      const def = row.getValue('operationalDefinition') as string | undefined
      return def ? (
        <div className="text-sm text-gray-700 max-w-xs">{def}</div>
      ) : (
        <span className="text-xs text-gray-400 italic">Not defined</span>
      )
    },
  },
  {
    id: 'indicatorCount',
    header: 'Indicators',
    cell: ({ row }) => {
      const count = row.original.indicators?.length || 0
      return (
        <Badge variant="outline" className="whitespace-nowrap">
          {count} indicator{count !== 1 ? 's' : ''}
        </Badge>
      )
    },
  },
]

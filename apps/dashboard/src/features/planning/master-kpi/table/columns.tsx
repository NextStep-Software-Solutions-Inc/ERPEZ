/**
 * Master KPI Table Columns Definition
 */

import { createColumnHelper } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { MasterKpiTableColumnHeader } from '../components/MasterKpiTableColumnHeader'
import { MasterKPI, getDistributionBehaviorColor } from '../types'
import { DataTableRowActions } from './data-table-row-actions'
import { getDistributionBehaviorLabel } from '../utils/kpiDistributionBehavior.ts'

const columnHelper = createColumnHelper<MasterKPI>()

// Color map for function categories
const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Strategic':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'Core':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'Support':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

export const columns = (
  onView: (kpi: MasterKPI) => void,
  onEdit: (kpi: MasterKPI) => void,
  onDelete: (kpi: MasterKPI) => void,
) => [
  columnHelper.accessor('code', {
    id: 'code',
    header: ({ column }) => (
      <MasterKpiTableColumnHeader column={column} title="Code" />
    ),
    cell: (info) => (
      <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
        {info.getValue()}
      </code>
    ),
    meta: { label: 'Code' },
    size: 100,
  }),
  columnHelper.accessor('name', {
    id: 'name',
    header: ({ column }) => (
      <MasterKpiTableColumnHeader column={column} title="Name" />
    ),
    cell: (info) => <div className="max-w-xs truncate">{info.getValue()}</div>,
    meta: { label: 'Name' },
    size: 250,
  }),
  columnHelper.accessor('tags.functionCategory', {
    id: 'functionCategory',
    header: ({ column }) => (
      <MasterKpiTableColumnHeader column={column} title="Function" />
    ),
    cell: (info) => (
      <Badge variant="outline" className={getCategoryColor(info.getValue())}>
        {info.getValue()}
      </Badge>
    ),
    filterFn: (row, id, value: string[]) => {
      return value.includes(row.getValue(id) as string)
    },
    meta: { label: 'Function' },
    size: 120,
  }),
  columnHelper.accessor('tags.complianceTags', {
    id: 'complianceTags',
    header: 'Compliance',
    cell: (info) => {
      const tags = info.getValue() || []
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag, idx) => (
            <Badge key={idx} variant="soft" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="soft" className="text-xs">
              +{tags.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    meta: { label: 'Compliance' },
    size: 150,
  }),
  columnHelper.accessor('isActive', {
    id: 'status',
    header: ({ column }) => (
      <MasterKpiTableColumnHeader column={column} title="Status" />
    ),
    cell: (info) => (
      <Badge variant={info.getValue() ? 'default' : 'outline'}>
        {info.getValue() ? 'Active' : 'Inactive'}
      </Badge>
    ),
    filterFn: (row, id, value: string[]) => {
      const val = String(row.getValue(id))
      return value.includes(val)
    },
    meta: { label: 'Status' },
    size: 100,
  }),
  columnHelper.accessor('targetDistributionBehavior', {
    id: 'distributionBehavior',
    header: 'Distribution',
    cell: (info) => {
      const behavior = info.getValue()
      if (!behavior)
        return <span className="text-xs text-muted-foreground">-</span>
      return (
        <Badge
          variant="outline"
          className={`text-xs ${getDistributionBehaviorColor(behavior)}`}
        >
          {getDistributionBehaviorLabel(behavior)}
        </Badge>
      )
    },
    meta: { label: 'Distribution' },
    size: 150,
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <DataTableRowActions
        row={row}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
    enableHiding: false,
    size: 120,
  }),
]

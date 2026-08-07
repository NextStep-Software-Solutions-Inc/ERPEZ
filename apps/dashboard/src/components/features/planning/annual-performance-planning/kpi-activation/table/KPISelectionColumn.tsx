/**
 * KPI Selection Dialog Column Definitions
 * Step 2: KPI Activation - Column definitions for available KPIs table
 */

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { KPISelectionActions } from './KPISelectionActions'
import type { MasterKPI } from '@/components/features/planning/annual-performance-planning/shared/utils/mockMasterKPIs'

/**
 * Helper function to format functionType values with proper spacing
 * e.g., 'StrategicPriority' -> 'Strategic Priority'
 */
function formatFunctionType(value: string): string {
  return value
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^ /, '')
}

interface KPISelectionColumnsOptions {
  onViewDetails?: (kpi: MasterKPI) => void
}

export function useDynamicColumns(options?: KPISelectionColumnsOptions): Array<ColumnDef<MasterKPI>> {
  return [
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
      accessorKey: 'code',
      header: 'KPI Code',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">{row.getValue('code')}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'KPI Name',
      cell: ({ row }) => {
        const data = row.original
        return (
          <div>
            <div className="font-medium text-gray-900">{row.getValue('name')}</div>
            {data.description && (
              <div className="text-sm text-gray-500 truncate max-w-xs">
                {data.description}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'functionType',
      header: 'Function',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {formatFunctionType(row.getValue('functionType') as string)}
        </Badge>
      ),
    },
    {
      accessorKey: 'defaultAggregation',
      header: 'Behaviour',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {row.getValue('defaultAggregation') || '-'}
        </Badge>
      ),
    },
    {
      accessorKey: 'unitOfMeasure',
      header: 'Unit',
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">{row.getValue('unitOfMeasure') || '-'}</span>
      ),
    },
    {
      accessorKey: 'fiscalYear',
      header: 'Year',
      cell: ({ row }) => <span>{row.getValue('fiscalYear')}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <KPISelectionActions
          kpi={row.original}
          onViewDetails={options?.onViewDetails || (() => {})}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ]
}

// Static export for backwards compatibility
export const KPISelectionColumn: Array<ColumnDef<MasterKPI>> = [
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
    accessorKey: 'code',
    header: 'KPI Code',
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">{row.getValue('code')}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: 'KPI Name',
    cell: ({ row }) => {
      const data = row.original
      return (
        <div>
          <div className="font-medium text-gray-900">{row.getValue('name')}</div>
          {data.description && (
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {data.description}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'functionType',
    header: 'Function',
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {formatFunctionType(row.getValue('functionType') as string)}
      </Badge>
    ),
  },
  {
    accessorKey: 'defaultAggregation',
    header: 'Behaviour',
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {row.getValue('defaultAggregation') || '-'}
      </Badge>
    ),
  },
  {
    accessorKey: 'unitOfMeasure',
    header: 'Unit',
    cell: ({ row }) => (
      <span className="text-sm text-gray-700">{row.getValue('unitOfMeasure') || '-'}</span>
    ),
  },
  {
    accessorKey: 'fiscalYear',
    header: 'Year',
    cell: ({ row }) => <span>{row.getValue('fiscalYear')}</span>,
  },
]

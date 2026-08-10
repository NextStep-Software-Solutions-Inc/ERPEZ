/**
 * App Step 2 Table Columns
 * Step 2: KPI Activation - Table columns for active KPIs management
 */

import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import type { ActiveKPI } from '@/components/features/planning/annual-performance-planning/shared/types/step2Types'

interface AppStep2TableColumnsProps {
  onEditKPI: (kpi: ActiveKPI) => void
  onDeleteKPI: (kpiId: string, kpiName: string) => void
}

export function useAppStep2TableColumns({
  onEditKPI,
  onDeleteKPI,
}: AppStep2TableColumnsProps): ColumnDef<ActiveKPI>[] {
  return [
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
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.getValue('name')}</div>
          {row.original.description && (
            <div className="text-sm text-gray-500 truncate max-w-lg">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'functionType',
      header: 'Function Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {row.getValue('functionType')}
        </Badge>
      ),
    },
    {
      accessorKey: 'aggregationMethod',
      header: 'Aggregation Method',
      cell: ({ row }) => (
        <Badge
          variant={row.original.isModified ? 'soft' : 'outline'}
          className="text-xs"
        >
          {row.getValue('aggregationMethod')}
        </Badge>
      ),
    },
    {
      accessorKey: 'isModified',
      header: 'Status',
      cell: ({ row }) =>
        row.original.isModified && (
          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
            Modified
          </Badge>
        ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditKPI(row.original)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteKPI(row.original.id, row.original.name)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
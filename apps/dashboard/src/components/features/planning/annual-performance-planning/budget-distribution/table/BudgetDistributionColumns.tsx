/**
 * Budget Distribution Table Columns
 * Defines all columns for the budget allocation table
 */

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import type { BudgetAllocation } from '../mocks'
import { BudgetDistributionActions } from '.'

interface UseBudgetDistributionColumnsProps {
  onEditAllocation?: (allocation: BudgetAllocation) => void
  onDeleteAllocation?: (allocationId: string, officeName: string) => void
}

export function useBudgetDistributionColumns(
  props?: UseBudgetDistributionColumnsProps
) {
  const { onEditAllocation, onDeleteAllocation } = props || {}

  const columns: ColumnDef<BudgetAllocation>[] = useMemo(
    () => [
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
        accessorKey: 'officeName',
        header: 'Office',
        cell: ({ row }) => (
          <div className="font-semibold text-gray-900">{row.original.officeName}</div>
        ),
      },
      {
        accessorKey: 'kpiCode',
        header: 'KPI Code',
        cell: ({ row }) => (
          <div className="text-sm text-gray-700">{row.original.kpiCode}</div>
        ),
      },
      {
        accessorKey: 'kpiName',
        header: 'KPI Name',
        cell: ({ row }) => (
          <div className="text-sm text-gray-700 max-w-xs truncate">{row.original.kpiName}</div>
        ),
      },
      {
        accessorKey: 'baseTarget',
        header: 'Base Target',
        cell: ({ row }) => (
          <div className="text-sm font-medium text-gray-900 text-center">
            {row.original.baseTarget.toFixed(2)}
          </div>
        ),
      },
      {
        accessorKey: 'allocatedBudget',
        header: 'Allocated Budget',
        cell: ({ row }) => (
          <Input
            type="number"
            min="0"
            step="0.01"
            value={row.original.allocatedBudget || ''}
            disabled={row.original.isLocked}
            className="w-24 text-sm h-8 text-center disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="0.00"
          />
        ),
      },
      {
        accessorKey: 'percentageOfTotal',
        header: '% of Total',
        cell: ({ row }) => (
          <div className="text-sm text-gray-700 text-center">
            {row.original.percentageOfTotal.toFixed(1)}%
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const statusColors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            allocated: 'bg-blue-100 text-blue-800',
            approved: 'bg-green-100 text-green-800',
          }
          return (
            <Badge
              variant="outline"
              className={`text-xs ${statusColors[row.original.status] || ''}`}
            >
              {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'isLocked',
        header: 'Lock Status',
        cell: ({ row }) => (
        <Badge
          variant="outline"
          className={`text-xs ${row.original.isLocked ? 'bg-red-50 border-red-200 text-red-700' : ''}`}
        >
          {row.original.isLocked ? 'Locked' : 'Unlocked'}
        </Badge>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <BudgetDistributionActions
            allocation={row.original}
            onEdit={() => onEditAllocation?.(row.original)}
            onDelete={() => onDeleteAllocation?.(row.original.id, row.original.officeName)}
          />
        ),
      },
    ],
    [onEditAllocation, onDeleteAllocation]
  )

  return columns
}

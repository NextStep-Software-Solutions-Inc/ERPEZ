/**
 * Market Scoping Table Columns
 * Centralized column definitions for the market scoping list table
 * Location: src/features/planning/market-scoping/tables/
 */

import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { getStatusByValue } from '../utils/constants'
import { formatCurrency } from '../utils/transformers'
import type { MarketScopingForm } from '../types/marketScopingTypes'
import { MarketScopingTableActions } from './MarketScopingTableActions'

interface MarketScopingTableColumnsProps {
  onViewDetails: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function createMarketScopingTableColumns({
  onViewDetails,
  onEdit,
  onDelete,
}: MarketScopingTableColumnsProps): ColumnDef<MarketScopingForm>[] {
  const col = createColumnHelper<MarketScopingForm>()

  return [
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
    col.accessor('projectName', {
      header: 'Project Name',
      cell: (info) => (
        <div className="min-w-0">
          <div className="font-medium text-sm text-foreground truncate max-w-xl">
            {info.getValue()}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {info.row.original.departmentUnit}
          </div>
        </div>
      ),
      enableSorting: true,
    }),
    col.accessor('estimatedBudget', {
      header: 'Budget',
      cell: (info) => (
        <span className="text-sm font-medium">
          {formatCurrency(info.getValue())}
        </span>
      ),
      enableSorting: true,
    }),
    col.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const statusObj = getStatusByValue(info.getValue())
        return (
          <Badge variant="outline" className={`${statusObj?.color || ''}`}>
            {statusObj?.label || info.getValue()}
          </Badge>
        )
      },
      enableSorting: true,
    }),
    col.display({
      id: 'actions',
      header: () => <span className="text-center block">Actions</span>,
      cell: ({ row }) => (
        <MarketScopingTableActions
          form={row.original}
          onViewDetails={() => onViewDetails(row.original.id)}
          onEdit={() => onEdit(row.original.id)}
          onDelete={() => onDelete(row.original.id)}
        />
      ),
    }),
  ] as ColumnDef<MarketScopingForm>[]
}

/**
 * Default Market Scoping columns (for backward compatibility with TemplateTable)
 * Used when row action callbacks are not needed
 */
export const MarketScopingColumns = createMarketScopingTableColumns({
  onViewDetails: () => {},
  onEdit: () => {},
  onDelete: () => {},
})

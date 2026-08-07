/**
 * Parameters Table Columns
 * Centralized column definitions for parameters management table
 * Uses TanStack Table's createColumnHelper for column definitions
 * Location: src/features/planning/market-scoping/tables/
 */

import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import type { ParameterDefinition } from '../types/managementTypes'
import { ParametersTableActions } from './ParametersTableActions'

interface ParametersTableColumnsProps {
  onEdit: (parameter: ParameterDefinition) => void
  onDelete: (parameter: ParameterDefinition) => void
}

export function createParametersTableColumns({
  onEdit,
  onDelete,
}: ParametersTableColumnsProps): ColumnDef<ParameterDefinition, any>[] {
  const col = createColumnHelper<ParameterDefinition>()

  return [
    col.accessor('displayName', {
      header: 'Parameter Name',
      cell: (info) => (
        <div className="min-w-0">
          <div className="font-medium text-sm text-foreground truncate">
            {info.getValue()}
          </div>
        </div>
      ),
      enableSorting: true,
    }),
    col.accessor('guidedQuestion', {
      header: 'Guided Question',
      cell: (info) => (
        <div className="text-sm text-muted-foreground max-w-xs truncate">
          {info.getValue()}
        </div>
      ),
      enableSorting: true,
    }),
    col.accessor('description', {
      header: 'Description',
      cell: (info) => (
        <div className="text-sm text-muted-foreground max-w-xs truncate">
          {info.getValue()}
        </div>
      ),
      enableSorting: false,
    }),
    col.accessor('sortOrder', {
      header: () => <span className="text-right block">Sort Order</span>,
      cell: (info) => (
        <span className="text-sm text-right block">
          {info.getValue()}
        </span>
      ),
      enableSorting: true,
    }),
    col.accessor('isActive', {
      header: 'Status',
      cell: (info) => (
        <Badge
          variant={info.getValue() ? 'outline' : 'soft'}
          className="whitespace-nowrap"
        >
          {info.getValue() ? 'Active' : 'Inactive'}
        </Badge>
      ),
      enableSorting: true,
    }),
    col.display({
      id: 'actions',
      header: 'Actions',
      cell: (props) => {
        const parameter = props.row.original
        return (
          <ParametersTableActions
            onEdit={() => onEdit(parameter)}
            onDelete={() => onDelete(parameter)}
          />
        )
      },
    }),
  ]
}

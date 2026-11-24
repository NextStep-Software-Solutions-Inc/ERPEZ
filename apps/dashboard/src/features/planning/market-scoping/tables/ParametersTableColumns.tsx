/**
 * Parameters Table Columns
 * Centralized column definitions for parameters management table
 * Uses TanStack Table's createColumnHelper for column definitions
 * Location: src/features/planning/market-scoping/tables/
 */

import type { ColumnDef } from '@tanstack/react-table'
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
}: ParametersTableColumnsProps): ColumnDef<ParameterDefinition>[] {
  return [
    {
      accessorKey: 'displayName',
      header: 'Parameter Name',
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="font-medium text-sm text-foreground truncate">
            {row.original.displayName}
          </div>
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'guidedQuestion',
      header: 'Guided Question',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground max-w-xs truncate">
          {row.original.guidedQuestion}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground max-w-xs truncate">
          {row.original.description || '-'}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'sortOrder',
      header: () => <span className="text-right block">Sort Order</span>,
      cell: ({ row }) => (
        <span className="text-sm text-right block">
          {row.original.sortOrder}
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant={row.original.isActive ? 'outline' : 'soft'}
          className="whitespace-nowrap"
        >
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const parameter = row.original
        return (
          <ParametersTableActions
            onEdit={() => onEdit(parameter)}
            onDelete={() => onDelete(parameter)}
          />
        )
      },
    },
  ]
}

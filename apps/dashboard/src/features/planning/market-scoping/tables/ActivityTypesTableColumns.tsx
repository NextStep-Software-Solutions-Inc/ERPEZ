/**
 * Activity Types Table Columns
 * Centralized column definitions for activity types management table
 * Uses TanStack Table's createColumnHelper for column definitions
 * Location: src/features/planning/market-scoping/tables/
 */

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import type { ActivityTypeDefinition } from '../types/managementTypes'
import { ActivityTypesTableActions } from './ActivityTypesTableActions'

interface ActivityTypesTableColumnsProps {
  onEdit: (activity: ActivityTypeDefinition) => void
  onDelete: (activity: ActivityTypeDefinition) => void
}

export function createActivityTypesTableColumns({
  onEdit,
  onDelete,
}: ActivityTypesTableColumnsProps): ColumnDef<ActivityTypeDefinition>[] {
  return [
    {
      accessorKey: 'type',
      header: 'Activity Type',
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="font-medium text-sm text-foreground truncate">
            {row.original.type}
          </div>
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'label',
      header: 'Label',
      cell: ({ row }) => (
        <div className="text-sm text-foreground">{row.original.label}</div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground max-w-xs truncate">
          {row.original.description}
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
        const activity = row.original
        return (
          <ActivityTypesTableActions
            onEdit={() => onEdit(activity)}
            onDelete={() => onDelete(activity)}
          />
        )
      },
    },
  ]
}

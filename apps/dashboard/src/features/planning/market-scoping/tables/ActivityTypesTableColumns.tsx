/**
 * Activity Types Table Columns
 * Centralized column definitions for activity types management table
 * Uses TanStack Table's createColumnHelper for column definitions
 * Location: src/features/planning/market-scoping/tables/
 */

import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
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
}: ActivityTypesTableColumnsProps): ColumnDef<ActivityTypeDefinition, any>[] {
  const col = createColumnHelper<ActivityTypeDefinition>()

  return [
    col.accessor('type', {
      header: 'Activity Type',
      cell: (info) => (
        <div className="min-w-0">
          <div className="font-medium text-sm text-foreground truncate">
            {info.getValue()}
          </div>
        </div>
      ),
      enableSorting: true,
    }),
    col.accessor('label', {
      header: 'Label',
      cell: (info) => (
        <div className="text-sm text-foreground">
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
        const activity = props.row.original
        return (
          <ActivityTypesTableActions
            onEdit={() => onEdit(activity)}
            onDelete={() => onDelete(activity)}
          />
        )
      },
    }),
  ]
}

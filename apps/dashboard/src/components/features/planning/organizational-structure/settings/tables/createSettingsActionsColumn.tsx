import type { ColumnDef } from '@tanstack/react-table'
import type { MetaActions } from '@/types/global'
import { SettingsActions } from './SettingsActions'

/**
 * Factory function to create a consistent actions column for all settings tables
 * Provides Edit and Delete actions based on permissions
 */
export function createSettingsActionsColumn<TData extends { id: string }>(
  actions: MetaActions,
  onEdit: (data: TData) => void,
  onDelete: (data: TData) => void,
): ColumnDef<TData> {
  return {
    id: 'actions',
    enableHiding: false,
    cell: ({ row, table }) => {
      const readonly = table.options.meta?.readonly
      const metaActions = Array.isArray(table.options.meta?.actions) 
        ? table.options.meta.actions 
        : actions
      const data = row.original

      return (
        <SettingsActions
          data={data}
          readonly={readonly}
          actions={metaActions}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )
    },
  }
}

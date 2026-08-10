import { Edit2, MoreHorizontal, Trash2 } from 'lucide-react'
import type { MetaActions } from '@/types/global'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SettingsActionsProps<TData> {
  data: TData
  readonly?: boolean
  actions?: MetaActions
  onEdit: (data: TData) => void
  onDelete: (data: TData) => void
}

export function SettingsActions<TData>({
  data,
  readonly = false,
  actions = [],
  onEdit,
  onDelete,
}: SettingsActionsProps<TData>) {
  const canEdit = actions.includes('write') && !readonly
  const canDelete = actions.includes('delete') && !readonly

  if (!canEdit && !canDelete) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <div className="p-2 flex flex-col gap-2 items-start">
          {/* Edit */}
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700"
              onClick={() => onEdit(data)}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}

          {/* Delete */}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => onDelete(data)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

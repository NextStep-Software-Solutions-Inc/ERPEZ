import { MoreHorizontal, Eye, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DeleteLIBActivityConfirmDialog } from '../dialogs/DeleteLIBActivityConfirmDialog'
import { LIBActivity } from '../types'

interface LIBActivityActionMenuProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  isDeleting?: boolean
  activity: LIBActivity
}

export function LIBActivityActionMenu({
  onView,
  onEdit,
  onDelete,
  isDeleting,
  activity,
}: LIBActivityActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          title="Actions"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {onView && (
          <DropdownMenuItem
            onClick={() => onView()}
            className=" cursor-pointer  gap-2 text-green-600 hover:text-green-700"
          >
            <Eye className="h-4 w-4" />
            View Details
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={onEdit} className="gap-2 cursor-pointer">
            <Edit className="h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DeleteLIBActivityConfirmDialog
            activity={activity}
            onConfirm={onDelete}
            isLoading={isDeleting}
            triggerVariant="ghost"
            triggerSize="sm"
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

import { MoreHorizontal, Eye, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DeleteExpenditureLineItemConfirmDialog } from './DeleteExpenditureLineItemConfirmDialog'
import type { LineItemBudgetDetails } from '../types/types'

interface ExpenditureLineItemActionMenuProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  isDeleting?: boolean
  item: LineItemBudgetDetails
}

export function ExpenditureLineItemActionMenu({
  onView,
  onEdit,
  onDelete,
  isDeleting,
  item,
}: ExpenditureLineItemActionMenuProps) {
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
      <DropdownMenuContent align="start" className="w-40">
        {onView && (
          <DropdownMenuItem
            onClick={() => onView()}
            className="cursor-pointer gap-2 px-3 text-green-600 hover:text-green-700"
          >
            <Eye className="h-4 w-4" />
            View Details
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem
            onClick={onEdit}
            className="gap-2 px-3 cursor-pointer"
          >
            <Edit className="h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DeleteExpenditureLineItemConfirmDialog
            item={item}
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

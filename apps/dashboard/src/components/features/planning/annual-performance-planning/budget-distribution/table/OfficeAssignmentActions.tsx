/**
 * Office Assignment Actions
 * Dropdown menu for assignment row actions
 */

import { Edit, Trash2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { OfficeAssignment } from '../mocks'

interface OfficeAssignmentActionsProps {
  assignment: OfficeAssignment
  onEdit?: () => void
  onDelete?: () => void
}

export function OfficeAssignmentActions({
  assignment,
  onEdit,
  onDelete,
}: OfficeAssignmentActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Target
        </DropdownMenuItem>
        {!assignment.isFromPlanning && (
          <DropdownMenuItem onClick={onDelete} className="text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Remove
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

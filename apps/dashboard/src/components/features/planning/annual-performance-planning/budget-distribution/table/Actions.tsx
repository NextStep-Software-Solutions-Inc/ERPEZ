/**
 * Budget Distribution Actions
 * Dropdown menu for budget allocation row actions
 */

import { Edit, Trash2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { BudgetAllocation } from '../mocks'

interface BudgetDistributionActionsProps {
  allocation: BudgetAllocation
  onEdit?: () => void
  onDelete?: () => void
}

export function BudgetDistributionActions({
  allocation,
  onEdit,
  onDelete,
}: BudgetDistributionActionsProps) {
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
          Edit Allocation
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-red-600">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

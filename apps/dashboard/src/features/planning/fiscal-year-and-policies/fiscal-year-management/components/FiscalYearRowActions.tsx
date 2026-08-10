import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
// import type { FiscalYear } from '@/lib/fiscal-year-and-policies/types';
import type { FiscalYear } from '../types/types'

interface FiscalYearRowActionsProps {
  fiscalYear: FiscalYear
  onEdit: (fiscalYear: FiscalYear) => void
  onDelete: (fiscalYear: FiscalYear) => void
}

/**
 * Row actions component with edit and delete options
 */
export function FiscalYearRowActions({
  fiscalYear,
  onEdit,
  onDelete,
}: FiscalYearRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(fiscalYear)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(fiscalYear)}
          className="text-destructive focus:text-destructive"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

import { MoreHorizontal, Eye, Edit, ListPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { KPICombination } from '../types'

interface KPIActionsProps {
  kpi: KPICombination
  hasTargets?: boolean
  onView?: (kpi: KPICombination) => void
  onEditTarget?: (kpi: KPICombination) => void
  onAddActivity?: (kpi: KPICombination) => void
}

export function KPIActions({
  kpi,
  hasTargets = false,
  onView,
  onEditTarget,
  onAddActivity,
}: KPIActionsProps) {
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
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuItem
          onClick={() => onView?.(kpi)}
          className="gap-2 cursor-pointer"
        >
          <Eye className="h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onEditTarget?.(kpi)}
          className="gap-2 cursor-pointer"
        >
          <Edit className="h-4 w-4" />
          {kpi.status === 'Shopped'
            ? hasTargets
              ? 'Edit Target'
              : 'Set Target'
            : 'Edit Target'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onAddActivity?.(kpi)}
          className="gap-2 cursor-pointer"
        >
          <ListPlus className="h-4 w-4" />
          Add Activity
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

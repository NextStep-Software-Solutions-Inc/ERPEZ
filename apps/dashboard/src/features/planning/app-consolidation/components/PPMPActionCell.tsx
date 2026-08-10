import { Button } from '@/components/ui/button'
import { MoreVertical, Trash2, Eye } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { PPMPItem } from '../types'

interface PPMPActionCellProps {
  item: PPMPItem
  onViewDetails: (item: PPMPItem) => void
  onDelete: (itemId: string) => void
}

export function PPMPActionCell({ item, onViewDetails, onDelete }: PPMPActionCellProps) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="pointer-events-auto cursor-pointer h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => onViewDetails(item)}
            className="text-blue-600 focus:text-blue-600 focus:bg-blue-50"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(item.id)}
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove PPMP
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

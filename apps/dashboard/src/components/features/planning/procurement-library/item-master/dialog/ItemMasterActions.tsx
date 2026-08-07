import { MoreHorizontal, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ItemMaster } from '../../types'

interface ItemMasterActionsProps {
  row: ItemMaster
  onView?: (item: ItemMaster) => void
  onEdit?: (item: ItemMaster) => void
  onDelete?: (id: string) => void
  onToggleStatus?: (id: string) => void
}

export function ItemMasterActions({ row, onView, onEdit, onDelete, onToggleStatus }: ItemMasterActionsProps) {
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
        <DropdownMenuItem onClick={() => onView?.(row)} className="gap-2 cursor-pointer">
          <Eye className="h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEdit?.(row)} className="gap-2 cursor-pointer">
          <Edit className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onToggleStatus?.(row.id)} className="gap-2 cursor-pointer">
          {row.status === 'active' ? (
            <>
              <XCircle className="h-4 w-4" />
              Inactivate
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Activate
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete?.(row.id)}
          className="gap-2 cursor-pointer text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Eye, Edit, Trash2, Copy, Archive } from 'lucide-react'

interface DataTableRowActionsProps<TData> {
  row: { original: TData }
  onView?: (data: TData) => void
  onEdit?: (data: TData) => void
  onDelete?: (data: TData) => void
  onCopy?: (data: TData) => void
  onArchive?: (data: TData) => void
}

export function DataTableRowActions<TData>({
  row,
  onView,
  onEdit,
  onDelete,
  onCopy,
  onArchive,
}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted hover:bg-muted/80 rounded-full"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px] p-1.5 space-y-1">
        {onView && (
          <DropdownMenuItem
            className="gap-2 cursor-pointer h-9 px-2 hover:bg-muted/80 transition-colors"
            onClick={() => onView(row.original)}
          >
            <Eye className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">View details</span>
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem
            className="gap-2 cursor-pointer h-9 px-2 hover:bg-muted/80 transition-colors"
            onClick={() => onEdit(row.original)}
          >
            <Edit className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Edit details</span>
          </DropdownMenuItem>
        )}
        {onCopy && (
          <DropdownMenuItem
            className="gap-2 cursor-pointer h-9 px-2 hover:bg-muted/80 transition-colors"
            onClick={() => onCopy(row.original)}
          >
            <Copy className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-medium">Duplicate</span>
          </DropdownMenuItem>
        )}

        {(onView || onEdit || onCopy) && (onArchive || onDelete) && (
          <DropdownMenuSeparator className="mx-1 my-1" />
        )}

        {onArchive && (
          <DropdownMenuItem
            className="gap-2 cursor-pointer h-9 px-2 hover:bg-muted/80 transition-colors"
            onClick={() => onArchive(row.original)}
          >
            <Archive className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">Archive</span>
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem
            className="gap-2 cursor-pointer h-9 px-2 hover:bg-destructive/10 text-destructive focus:text-destructive transition-colors group"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="h-4 w-4 text-destructive/80 group-hover:text-destructive" />
            <span className="text-sm font-medium">Delete record</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

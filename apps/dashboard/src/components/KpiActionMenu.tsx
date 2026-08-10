import { MoreHorizontal, Eye, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface KpiActionMenuProps {
    onView?: () => void
    onAdd?: () => void
    onRemove?: () => void
    isSubKpi?: boolean
}

export function KpiActionMenu({ onView, onAdd, onRemove, isSubKpi = false }: KpiActionMenuProps) {

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
                {!isSubKpi && onView && (
                    <DropdownMenuItem onClick={onView} className="gap-2 cursor-pointer">
                        <Eye className="h-4 w-4" />
                        View Details
                    </DropdownMenuItem>
                )}
                {isSubKpi && onView && (
                    <DropdownMenuItem onClick={onView} className="gap-2 cursor-pointer">
                        <Eye className="h-4 w-4" />
                        View Details
                    </DropdownMenuItem>
                )}
                {onAdd && (
                    <DropdownMenuItem onClick={onAdd} className="gap-2 cursor-pointer">
                        <Plus className="h-4 w-4" />
                        Add to List
                    </DropdownMenuItem>
                )}
                {onRemove && (
                    <DropdownMenuItem onClick={onRemove} className="gap-2 cursor-pointer text-red-600">
                        <Trash2 className="h-4 w-4" />
                        Remove
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

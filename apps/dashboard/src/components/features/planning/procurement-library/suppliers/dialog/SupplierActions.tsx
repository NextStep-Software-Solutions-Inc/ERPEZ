import {
  MoreHorizontal,
  Eye,
  PencilLine,
  Trash2,
  Shield,
  ShieldOff,
  Check,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { SupplierListItem } from '../types'

interface SupplierActionsProps {
  row: SupplierListItem
  onView?: (item: SupplierListItem) => void
  onEdit?: (item: SupplierListItem) => void
  onApprove?: (item: SupplierListItem) => void
  onDecline?: (item: SupplierListItem) => void
  onToggleBlacklist?: (item: SupplierListItem) => void
  onDelete?: (item: SupplierListItem) => void
}

export function SupplierActions({
  row,
  onView,
  onEdit,
  onApprove,
  onDecline,
  onToggleBlacklist,
  onDelete,
}: SupplierActionsProps) {
  const isPending = String(row.status).toLowerCase() === 'pending'

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
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => onView?.(row)}
          className="gap-2 cursor-pointer"
        >
          <Eye className="h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onEdit?.(row)}
          className="gap-2 cursor-pointer"
        >
          <PencilLine className="h-4 w-4" />
          Edit Supplier
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isPending && onApprove && (
          <>
            <DropdownMenuItem
              onClick={() => onApprove(row)}
              className="gap-2 cursor-pointer text-green-600 hover:text-green-600"
            >
              <Check className="h-4 w-4" />
              Approve
            </DropdownMenuItem>
          </>
        )}
        {isPending && onDecline && (
          <DropdownMenuItem
            onClick={() => onDecline(row)}
            className="gap-2 cursor-pointer text-red-600 hover:text-red-600"
          >
            <X className="h-4 w-4" />
            Decline
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onToggleBlacklist?.(row)}
          className="gap-2 cursor-pointer text-orange-600 hover:text-orange-600"
        >
          {row.isBlacklisted ? (
            <ShieldOff className="h-4 w-4" />
          ) : (
            <Shield className="h-4 w-4" />
          )}
          {row.isBlacklisted ? 'Unblock' : 'Block'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete?.(row)}
          className="gap-2 cursor-pointer text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

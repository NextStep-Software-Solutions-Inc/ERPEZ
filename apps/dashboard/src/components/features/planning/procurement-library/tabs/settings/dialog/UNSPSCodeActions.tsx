import { useState } from 'react'
import { MoreHorizontal, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UNSPSCodeDeleteConfirmationDialog } from './UNSPSCodeDeleteConfirmationDialog'
import PermissionCheck from '@/components/PermissionCheck'
import type { UNSPSCode } from '../../../types'
import type { MetaActions } from '@/types/global'

interface UNSPSCodeActionsProps {
  row: UNSPSCode
  actions?: MetaActions
  onEdit?: (unspscCode: UNSPSCode) => void
  onDelete?: (unspscCodeId: string) => void
  onToggleStatus?: (unspscCodeId: string) => void
}

export function UNSPSCodeActions({ row, actions = ['read'], onEdit, onDelete, onToggleStatus }: UNSPSCodeActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true)
      await new Promise(resolve => setTimeout(resolve, 300))
      onDelete?.(row.id)
      setDeleteDialogOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <PermissionCheck action="write" actions={actions}>
            <DropdownMenuItem onClick={() => onEdit?.(row)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleStatus?.(row.id)}>
              {row.IsActive ? (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
          </PermissionCheck>
          <PermissionCheck action="delete" actions={actions}>
            <DropdownMenuItem
              onClick={() => setDeleteDialogOpen(true)}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </PermissionCheck>
        </DropdownMenuContent>
      </DropdownMenu>

      <UNSPSCodeDeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        codeName={row.Name}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  )
}
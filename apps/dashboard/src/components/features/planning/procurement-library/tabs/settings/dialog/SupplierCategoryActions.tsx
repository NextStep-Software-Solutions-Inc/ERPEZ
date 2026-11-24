import { useState } from 'react'
import { MoreHorizontal, Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SupplierCategoryDeleteConfirmationDialog } from './SupplierCategoryDeleteConfirmationDialog'
import PermissionCheck from '@/components/PermissionCheck'
import { useDeleteSupplierCategory } from '@/lib/fiscal-year-and-policies/requests/hooks/useSupplierCategories'
import { useToast } from '@/components/ui/use-toast'
import type { SupplierCategory } from '../../../types'
import type { MetaActions } from '@/types/global'

interface SupplierCategoryActionsProps {
  row: SupplierCategory
  actions?: MetaActions
  onEdit?: (category: SupplierCategory) => void
  onDelete?: (categoryId: string) => void
}

export function SupplierCategoryActions({
  row,
  actions = ['read'],
  onEdit,
  onDelete,
}: SupplierCategoryActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const deleteMutation = useDeleteSupplierCategory()
  const { toast } = useToast()
  const isDeleting = deleteMutation.isPending

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ pathParams: { id: row.id } })
      toast({
        title: 'Success',
        description: `Supplier category "${row.name}" has been deleted successfully.`,
        color: 'success',
      })
      onDelete?.(row.id)
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('Error deleting supplier category:', error)
      toast({
        title: 'Error',
        description: 'Error deleting supplier category. Please try again.',
        color: 'destructive',
      })
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

      <SupplierCategoryDeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        categoryName={row.name}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  )
}

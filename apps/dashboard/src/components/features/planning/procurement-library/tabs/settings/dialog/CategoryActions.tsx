import { useState } from 'react'
import { MoreHorizontal, Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CategoryDeleteConfirmationDialog } from './CategoryDeleteConfirmationDialog'
import PermissionCheck from '@/components/PermissionCheck'
import { useDeleteProcurementCategory } from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementCategories'
import { useToast } from '@/components/ui/use-toast'
import type { Category } from '../../../types'
import type { MetaActions } from '@/types/global'

interface CategoryActionsProps {
  row: Category
  actions?: MetaActions
  onEdit?: (category: Category) => void
  onDelete?: (categoryId: string) => void
}

export function CategoryActions({ row, actions = ['read'], onEdit, onDelete }: CategoryActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const deleteMutation = useDeleteProcurementCategory()
  const { toast } = useToast()
  const isDeleting = deleteMutation.isPending

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ pathParams: { id: row.id } })
      onDelete?.(row.id)
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: 'Error',
        description: 'Error deleting category. Please try again.',
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

      <CategoryDeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        categoryName={row.name}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  )
}
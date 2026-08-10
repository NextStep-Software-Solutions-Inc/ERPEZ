import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import PermissionCheck from '@/components/PermissionCheck'
import { CategoryForm } from './CategoryForm'
import { useToast } from '@/components/ui/use-toast'
import { useUpdateProcurementCategory } from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementCategories'
import type { Category, CategoryFormData } from '../../../types'
import type { MetaActions } from '@/types/global'

interface EditCategoryDialogProps {
  category: Category
  actions: MetaActions
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditSuccess?: (data: CategoryFormData, categoryId: string) => void
  onRefresh?: () => void
}

export function EditCategoryDialog({
  category,
  actions,
  open,
  onOpenChange,
  onEditSuccess,
  onRefresh,
}: EditCategoryDialogProps) {
  const { toast } = useToast()
  const updateMutation = useUpdateProcurementCategory()
  const isLoading = updateMutation.isPending

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      await updateMutation.mutateAsync({
        pathParams: { id: category.id },
        payload: {
          name: data.name,
          description: data.description ?? null,
        },
      })
      onEditSuccess?.(data, category.id)
      onRefresh?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating category:', error)
      toast({
        title: 'Error',
        description: 'Error updating category. Please try again.',
        color: 'destructive',
      })
    }
  }

  const initialData: CategoryFormData = {
    name: category.name,
    description: category.description,
  }

  return (
    <PermissionCheck action="write" actions={actions}>
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Edit Category"
        description="Update category information"
        footer={null}
        showCloseButton
      >
        <CategoryForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          initialData={initialData}
          isLoading={isLoading}
        />
      </ResponsiveDialog>
    </PermissionCheck>
  )
}
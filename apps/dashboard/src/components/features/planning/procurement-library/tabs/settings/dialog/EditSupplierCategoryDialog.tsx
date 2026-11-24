import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import PermissionCheck from '@/components/PermissionCheck'
import { SupplierCategoryForm } from './SupplierCategoryForm'
import { useToast } from '@/components/ui/use-toast'
import { useUpdateSupplierCategory } from '@/lib/fiscal-year-and-policies/requests/hooks/useSupplierCategories'
import type { SupplierCategory, SupplierCategoryFormData } from '../../../types'
import type { MetaActions } from '@/types/global'

interface EditSupplierCategoryDialogProps {
  category: SupplierCategory
  actions: MetaActions
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditSuccess?: (data: SupplierCategoryFormData, categoryId: string) => void
  onRefresh?: () => void
}

export function EditSupplierCategoryDialog({
  category,
  actions,
  open,
  onOpenChange,
  onEditSuccess,
  onRefresh,
}: EditSupplierCategoryDialogProps) {
  const { toast } = useToast()
  const updateMutation = useUpdateSupplierCategory()
  const isLoading = updateMutation.isPending

  const handleSubmit = async (data: SupplierCategoryFormData) => {
    try {
      await updateMutation.mutateAsync({
        pathParams: { id: category.id },
        payload: {
          name: data.name,
          description: data.description ?? null,
        },
      })
      toast({
        title: 'Success',
        description: `Supplier category "${data.name}" has been updated successfully.`,
        color: 'success',
      })
      onEditSuccess?.(data, category.id)
      onRefresh?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating supplier category:', error)
      toast({
        title: 'Error',
        description: 'Error updating supplier category. Please try again.',
        color: 'destructive',
      })
    }
  }

  const initialData: SupplierCategoryFormData = {
    name: category.name,
    description: category.description,
  }

  return (
    <PermissionCheck action="write" actions={actions}>
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Edit Category"
        description="Update supplier category information"
        footer={null}
        showCloseButton
      >
        <SupplierCategoryForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          initialData={initialData}
          isLoading={isLoading}
        />
      </ResponsiveDialog>
    </PermissionCheck>
  )
}

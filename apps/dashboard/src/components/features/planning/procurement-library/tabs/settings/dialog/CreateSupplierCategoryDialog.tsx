import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import PermissionCheck from '@/components/PermissionCheck'
import { SupplierCategoryForm } from './SupplierCategoryForm'
import { useToast } from '@/components/ui/use-toast'
import { useCreateSupplierCategory } from '@/lib/fiscal-year-and-policies/requests/hooks/useSupplierCategories'
import type { SupplierCategoryFormData } from '../../../types'
import type { MetaActions } from '@/types/global'

interface CreateSupplierCategoryDialogProps {
  actions: MetaActions
  onCreateSuccess?: (data: SupplierCategoryFormData) => void
  onRefresh?: () => void
}

export function CreateSupplierCategoryDialog({
  actions,
  onCreateSuccess,
  onRefresh,
}: CreateSupplierCategoryDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const createMutation = useCreateSupplierCategory()
  const isLoading = createMutation.isPending

  const handleSubmit = async (data: SupplierCategoryFormData) => {
    try {
      await createMutation.mutateAsync({
        pathParams: {},
        payload: {
          name: data.name,
          description: data.description ?? null,
        },
      })
      toast({
        title: 'Success',
        description: `Supplier category "${data.name}" has been created successfully.`,
        color: 'success',
      })
      onCreateSuccess?.(data)
      onRefresh?.()
      setOpen(false)
    } catch (error) {
      console.error('Error creating supplier category:', error)
      toast({
        title: 'Error',
        description: 'Error creating supplier category. Please try again.',
        color: 'destructive',
      })
    }
  }

  return (
    <PermissionCheck action="write" actions={actions}>
      <ResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        title="Add Category"
        description="Create a new supplier category"
        trigger={
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        }
        footer={null}
        showCloseButton
      >
        <SupplierCategoryForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isLoading={isLoading}
        />
      </ResponsiveDialog>
    </PermissionCheck>
  )
}

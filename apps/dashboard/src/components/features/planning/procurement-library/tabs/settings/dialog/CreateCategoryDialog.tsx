import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import PermissionCheck from '@/components/PermissionCheck'
import { CategoryForm } from './CategoryForm'
import { useToast } from '@/components/ui/use-toast'
import { useCreateProcurementCategory } from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementCategories'
import type { CategoryFormData } from '../../../types'
import type { MetaActions } from '@/types/global'

interface CreateCategoryDialogProps {
  actions: MetaActions
  onCreateSuccess?: (data: CategoryFormData) => void
  onRefresh?: () => void
}

export function CreateCategoryDialog({
  actions,
  onCreateSuccess,
  onRefresh,
}: CreateCategoryDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const createMutation = useCreateProcurementCategory()
  const isLoading = createMutation.isPending

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      await createMutation.mutateAsync({
        pathParams: {},
        payload: {
          name: data.name,
          description: data.description ?? null,
        },
      })
      onCreateSuccess?.(data)
      onRefresh?.()
      setOpen(false)
    } catch (error) {
      console.error('Error creating category:', error)
      toast({
        title: 'Error',
        description: 'Error creating category. Please try again.',
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
        description="Create a new procurement category"
        trigger={
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        }
        footer={null}
        showCloseButton
      >
        <CategoryForm onSubmit={handleSubmit} onCancel={() => setOpen(false)} isLoading={isLoading} />
      </ResponsiveDialog>
    </PermissionCheck>
  )
}
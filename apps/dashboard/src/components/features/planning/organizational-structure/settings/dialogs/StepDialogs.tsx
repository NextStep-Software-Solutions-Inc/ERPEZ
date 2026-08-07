import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { StepForm } from '@/components/features/planning/organizational-structure/settings/forms/StepForm'
import {
  useCreateStep,
  useUpdateStep,
  useDeleteStep,
} from '@/pages/planning/organization/hooks/useSettings'
import type { StepSetting, StepFormValues as StepFormValuesType } from '@/components/features/planning/organizational-structure/types'

interface StepDialogsProps {
  createOpen: boolean
  onCreateOpenChange: (open: boolean) => void
  editingItem: StepSetting | null
  onEditingItemChange: (item: StepSetting | null) => void
  deleteItem: StepSetting | null
  onDeleteItemChange: (item: StepSetting | null) => void
}

export function StepDialogs({
  createOpen,
  onCreateOpenChange,
  editingItem,
  onEditingItemChange,
  deleteItem,
  onDeleteItemChange,
}: StepDialogsProps) {
  const createMutation = useCreateStep()
  const updateMutation = useUpdateStep()
  const deleteMutation = useDeleteStep()

  const handleCreate = async (values: StepFormValuesType) => {
    await createMutation.mutateAsync({ pathParams: {}, payload: values })
    onCreateOpenChange(false)
  }

  const handleUpdate = async (values: StepFormValuesType) => {
    if (editingItem) {
      await updateMutation.mutateAsync({ pathParams: { id: editingItem.id }, payload: values })
      onEditingItemChange(null)
    }
  }

  const handleDelete = async () => {
    if (deleteItem) {
      await deleteMutation.mutateAsync({ pathParams: { id: deleteItem.id } })
      onDeleteItemChange(null)
    }
  }

  return (
    <>
      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={onCreateOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Step</DialogTitle>
            <DialogDescription>Add a new salary step to your organization</DialogDescription>
          </DialogHeader>
          <StepForm onSubmit={handleCreate} isLoading={createMutation.isPending} mode="create" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && onEditingItemChange(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Step</DialogTitle>
              <DialogDescription>Modify salary step settings</DialogDescription>
            </DialogHeader>
            <StepForm initialValues={editingItem} onSubmit={handleUpdate} isLoading={updateMutation.isPending} mode="edit" />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && onDeleteItemChange(null)}
        title="Delete Step"
        description={`Are you sure you want to delete "Step ${deleteItem?.stepNumber}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}

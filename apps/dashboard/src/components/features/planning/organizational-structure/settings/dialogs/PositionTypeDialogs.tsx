import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { PositionTypeForm } from '@/components/features/planning/organizational-structure/settings/forms/PositionTypeForm'
import {
  useCreatePositionType,
  useUpdatePositionType,
  useDeletePositionType,
} from '@/pages/planning/organization/hooks/useSettings'
import type { PositionTypeSetting, PositionTypeFormValues } from '@/components/features/planning/organizational-structure/types'

interface PositionTypeDialogsProps {
  createOpen: boolean
  onCreateOpenChange: (open: boolean) => void
  editingItem: PositionTypeSetting | null
  onEditingItemChange: (item: PositionTypeSetting | null) => void
  deleteItem: PositionTypeSetting | null
  onDeleteItemChange: (item: PositionTypeSetting | null) => void
}

export function PositionTypeDialogs({
  createOpen,
  onCreateOpenChange,
  editingItem,
  onEditingItemChange,
  deleteItem,
  onDeleteItemChange,
}: PositionTypeDialogsProps) {
  const createMutation = useCreatePositionType()
  const updateMutation = useUpdatePositionType()
  const deleteMutation = useDeletePositionType()

  const handleCreate = async (values: PositionTypeFormValues) => {
    await createMutation.mutateAsync({ pathParams: {}, payload: values })
    onCreateOpenChange(false)
  }

  const handleUpdate = async (values: PositionTypeFormValues) => {
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
            <DialogTitle>Create Position Type</DialogTitle>
            <DialogDescription>Add a new position type to your organization structure</DialogDescription>
          </DialogHeader>
          <PositionTypeForm onSubmit={handleCreate} isLoading={createMutation.isPending} mode="create" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && onEditingItemChange(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Position Type</DialogTitle>
              <DialogDescription>Modify position type settings</DialogDescription>
            </DialogHeader>
            <PositionTypeForm initialValues={editingItem} onSubmit={handleUpdate} isLoading={updateMutation.isPending} mode="edit" />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && onDeleteItemChange(null)}
        title="Delete Position Type"
        description={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}

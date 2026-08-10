import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { OfficeTypeForm } from '@/components/features/planning/organizational-structure/settings/forms/OfficeTypeForm'
import {
  useCreateOfficeType,
  useUpdateOfficeType,
  useDeleteOfficeType,
} from '@/pages/planning/organization/hooks/useSettings'
import type { OfficeTypeEntity, OfficeTypeFormValues } from '@/components/features/planning/organizational-structure/types'

interface OfficeTypeDialogsProps {
  createOpen: boolean
  onCreateOpenChange: (open: boolean) => void
  editingItem: OfficeTypeEntity | null
  onEditingItemChange: (item: OfficeTypeEntity | null) => void
  deleteItem: OfficeTypeEntity | null
  onDeleteItemChange: (item: OfficeTypeEntity | null) => void
}

export function OfficeTypeDialogs({
  createOpen,
  onCreateOpenChange,
  editingItem,
  onEditingItemChange,
  deleteItem,
  onDeleteItemChange,
}: OfficeTypeDialogsProps) {
  const createMutation = useCreateOfficeType()
  const updateMutation = useUpdateOfficeType()
  const deleteMutation = useDeleteOfficeType()

  const handleCreate = async (values: OfficeTypeFormValues) => {
    await createMutation.mutateAsync({ pathParams: {}, payload: values })
    onCreateOpenChange(false)
  }

  const handleUpdate = async (values: OfficeTypeFormValues) => {
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
            <DialogTitle>Create Office Type</DialogTitle>
            <DialogDescription>Add a new office type to your organization structure</DialogDescription>
          </DialogHeader>
          <OfficeTypeForm onSubmit={handleCreate} isLoading={createMutation.isPending} mode="create" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && onEditingItemChange(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Office Type</DialogTitle>
              <DialogDescription>Modify office type settings</DialogDescription>
            </DialogHeader>
            <OfficeTypeForm initialValues={editingItem} onSubmit={handleUpdate} isLoading={updateMutation.isPending} mode="edit" />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && onDeleteItemChange(null)}
        title="Delete Office Type"
        description={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}

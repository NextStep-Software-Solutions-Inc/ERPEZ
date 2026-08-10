import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { AdministrativeLevelForm } from '@/components/features/planning/organizational-structure/settings/forms/AdministrativeLevelForm'
import {
  useCreateAdministrativeLevel,
  useUpdateAdministrativeLevel,
  useDeleteAdministrativeLevel,
} from '@/pages/planning/organization/hooks/useSettings'
import type { AdministrativeLevel, AdministrativeLevelFormValues } from '@/components/features/planning/organizational-structure/types'

interface AdministrativeLevelDialogsProps {
  createOpen: boolean
  onCreateOpenChange: (open: boolean) => void
  editingItem: AdministrativeLevel | null
  onEditingItemChange: (item: AdministrativeLevel | null) => void
  deleteItem: AdministrativeLevel | null
  onDeleteItemChange: (item: AdministrativeLevel | null) => void
}

export function AdministrativeLevelDialogs({
  createOpen,
  onCreateOpenChange,
  editingItem,
  onEditingItemChange,
  deleteItem,
  onDeleteItemChange,
}: AdministrativeLevelDialogsProps) {
  const createMutation = useCreateAdministrativeLevel()
  const updateMutation = useUpdateAdministrativeLevel()
  const deleteMutation = useDeleteAdministrativeLevel()

  const handleCreate = async (values: AdministrativeLevelFormValues) => {
    await createMutation.mutateAsync({ pathParams: {}, payload: values })
    onCreateOpenChange(false)
  }

  const handleUpdate = async (values: AdministrativeLevelFormValues) => {
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
            <DialogTitle>Create Administrative Level</DialogTitle>
            <DialogDescription>Add a new hierarchical level to your organization structure</DialogDescription>
          </DialogHeader>
          <AdministrativeLevelForm onSubmit={handleCreate} isLoading={createMutation.isPending} mode="create" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && onEditingItemChange(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Administrative Level</DialogTitle>
              <DialogDescription>Update the administrative level settings</DialogDescription>
            </DialogHeader>
            <AdministrativeLevelForm
              onSubmit={handleUpdate}
              isLoading={updateMutation.isPending}
              mode="edit"
              initialData={editingItem}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && onDeleteItemChange(null)}
        title="Delete Administrative Level"
        description={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}

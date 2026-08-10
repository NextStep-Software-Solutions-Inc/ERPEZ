import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { OfficeCategoryForm } from '@/components/features/planning/organizational-structure/settings/forms/OfficeCategoryForm'
import {
  useCreateOfficeCategory,
  useUpdateOfficeCategory,
  useDeleteOfficeCategory,
} from '@/pages/planning/organization/hooks/useSettings'
import type { OfficeCategoryEntity, OfficeCategoryFormValues } from '@/components/features/planning/organizational-structure/types'

interface OfficeCategoryDialogsProps {
  createOpen: boolean
  onCreateOpenChange: (open: boolean) => void
  editingItem: OfficeCategoryEntity | null
  onEditingItemChange: (item: OfficeCategoryEntity | null) => void
  deleteItem: OfficeCategoryEntity | null
  onDeleteItemChange: (item: OfficeCategoryEntity | null) => void
}

export function OfficeCategoryDialogs({
  createOpen,
  onCreateOpenChange,
  editingItem,
  onEditingItemChange,
  deleteItem,
  onDeleteItemChange,
}: OfficeCategoryDialogsProps) {
  const createMutation = useCreateOfficeCategory()
  const updateMutation = useUpdateOfficeCategory()
  const deleteMutation = useDeleteOfficeCategory()

  const handleCreate = (values: OfficeCategoryFormValues) => {
    createMutation.mutate({ pathParams: {}, payload: values })
    onCreateOpenChange(false)
  }

  const handleUpdate = (values: OfficeCategoryFormValues) => {
    if (editingItem) {
      updateMutation.mutate({ pathParams: { id: editingItem.id }, payload: values })
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
            <DialogTitle>Create Office Category</DialogTitle>
            <DialogDescription>Add a new office category to your organization structure</DialogDescription>
          </DialogHeader>
          <OfficeCategoryForm onSubmit={handleCreate} isLoading={createMutation.isPending} mode="create" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && onEditingItemChange(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Office Category</DialogTitle>
              <DialogDescription>Modify office category settings</DialogDescription>
            </DialogHeader>
            <OfficeCategoryForm initialValues={editingItem} onSubmit={handleUpdate} isLoading={updateMutation.isPending} mode="edit" />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && onDeleteItemChange(null)}
        title="Delete Office Category"
        description={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}


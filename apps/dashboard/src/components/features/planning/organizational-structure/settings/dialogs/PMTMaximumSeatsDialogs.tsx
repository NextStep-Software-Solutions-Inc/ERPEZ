import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { PMTMaximumSeatsForm } from '@/components/features/planning/organizational-structure/settings/forms/PMTMaximumSeatsForm'
import {
  useCreatePMTMaximumSeats,
  useUpdatePMTMaximumSeats,
  useDeletePMTMaximumSeats,
} from '@/pages/planning/organization/hooks/useSettings'
import type { PMTMaximumSeatsSetting, PMTMaximumSeatsFormValues } from '@/components/features/planning/organizational-structure/types'

interface PMTMaximumSeatsDialogsProps {
  createOpen: boolean
  onCreateOpenChange: (open: boolean) => void
  editingItem: PMTMaximumSeatsSetting | null
  onEditingItemChange: (item: PMTMaximumSeatsSetting | null) => void
  deleteItem: PMTMaximumSeatsSetting | null
  onDeleteItemChange: (item: PMTMaximumSeatsSetting | null) => void
}

export function PMTMaximumSeatsDialogs({
  createOpen,
  onCreateOpenChange,
  editingItem,
  onEditingItemChange,
  deleteItem,
  onDeleteItemChange,
}: PMTMaximumSeatsDialogsProps) {
  const createMutation = useCreatePMTMaximumSeats()
  const updateMutation = useUpdatePMTMaximumSeats()
  const deleteMutation = useDeletePMTMaximumSeats()

  const handleCreate = async (values: PMTMaximumSeatsFormValues) => {
    await createMutation.mutateAsync({ pathParams: {}, payload: values })
    onCreateOpenChange(false)
  }

  const handleUpdate = async (values: PMTMaximumSeatsFormValues) => {
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
            <DialogTitle>Create PMT Maximum Seats Setting</DialogTitle>
            <DialogDescription>Add new PMT maximum seats configuration</DialogDescription>
          </DialogHeader>
          <PMTMaximumSeatsForm onSubmit={handleCreate} isLoading={createMutation.isPending} mode="create" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && onEditingItemChange(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit PMT Maximum Seats Setting</DialogTitle>
              <DialogDescription>Modify PMT maximum seats configuration</DialogDescription>
            </DialogHeader>
            <PMTMaximumSeatsForm initialValues={editingItem} onSubmit={handleUpdate} isLoading={updateMutation.isPending} mode="edit" />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && onDeleteItemChange(null)}
        title="Delete PMT Maximum Seats Setting"
        description={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}

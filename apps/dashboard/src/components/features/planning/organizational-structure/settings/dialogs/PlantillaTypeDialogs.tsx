import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { PlantillaTypeForm } from '@/components/features/planning/organizational-structure/settings/forms/PlantillaTypeForm'
import {
  useCreatePlantillaType,
  useUpdatePlantillaType,
  useDeletePlantillaType,
} from '@/pages/planning/organization/hooks/useSettings'
import type { PlantillaTypeSetting, PlantillaTypeFormValues } from '@/components/features/planning/organizational-structure/types'

interface PlantillaTypeDialogsProps {
  createOpen: boolean
  onCreateOpenChange: (open: boolean) => void
  editingItem: PlantillaTypeSetting | null
  onEditingItemChange: (item: PlantillaTypeSetting | null) => void
  deleteItem: PlantillaTypeSetting | null
  onDeleteItemChange: (item: PlantillaTypeSetting | null) => void
}

export function PlantillaTypeDialogs({
  createOpen,
  onCreateOpenChange,
  editingItem,
  onEditingItemChange,
  deleteItem,
  onDeleteItemChange,
}: PlantillaTypeDialogsProps) {
  const createMutation = useCreatePlantillaType()
  const updateMutation = useUpdatePlantillaType()
  const deleteMutation = useDeletePlantillaType()

  const handleCreate = async (values: PlantillaTypeFormValues) => {
    await createMutation.mutateAsync({ pathParams: {}, payload: values })
    onCreateOpenChange(false)
  }

  const handleUpdate = async (values: PlantillaTypeFormValues) => {
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
            <DialogTitle>Create Plantilla Type</DialogTitle>
            <DialogDescription>Add a new plantilla type to your organization structure</DialogDescription>
          </DialogHeader>
          <PlantillaTypeForm onSubmit={handleCreate} isLoading={createMutation.isPending} mode="create" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && onEditingItemChange(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Plantilla Type</DialogTitle>
              <DialogDescription>Modify plantilla type settings</DialogDescription>
            </DialogHeader>
            <PlantillaTypeForm initialValues={editingItem} onSubmit={handleUpdate} isLoading={updateMutation.isPending} mode="edit" />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && onDeleteItemChange(null)}
        title="Delete Plantilla Type"
        description={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}

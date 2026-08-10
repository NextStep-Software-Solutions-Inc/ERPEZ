import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { SatelliteClusterForm } from '@/components/features/planning/organizational-structure/settings/forms/SatelliteClusterForm'
import {
  useCreateSatelliteCluster,
  useUpdateSatelliteCluster,
  useDeleteSatelliteCluster,
} from '@/pages/planning/organization/hooks/useSettings'
import type { SatelliteClusterSetting, SatelliteClusterFormValues } from '@/components/features/planning/organizational-structure/types'

interface SatelliteClusterDialogsProps {
  createOpen: boolean
  onCreateOpenChange: (open: boolean) => void
  editingItem: SatelliteClusterSetting | null
  onEditingItemChange: (item: SatelliteClusterSetting | null) => void
  deleteItem: SatelliteClusterSetting | null
  onDeleteItemChange: (item: SatelliteClusterSetting | null) => void
}

export function SatelliteClusterDialogs({
  createOpen,
  onCreateOpenChange,
  editingItem,
  onEditingItemChange,
  deleteItem,
  onDeleteItemChange,
}: SatelliteClusterDialogsProps) {
  const createMutation = useCreateSatelliteCluster()
  const updateMutation = useUpdateSatelliteCluster()
  const deleteMutation = useDeleteSatelliteCluster()

  const handleCreate = async (values: SatelliteClusterFormValues) => {
    await createMutation.mutateAsync({ pathParams: {}, payload: values })
    onCreateOpenChange(false)
  }

  const handleUpdate = async (values: SatelliteClusterFormValues) => {
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
            <DialogTitle>Create Satellite Cluster</DialogTitle>
            <DialogDescription>Add a new satellite cluster to your organization structure</DialogDescription>
          </DialogHeader>
          <SatelliteClusterForm onSubmit={handleCreate} isLoading={createMutation.isPending} mode="create" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && onEditingItemChange(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Satellite Cluster</DialogTitle>
              <DialogDescription>Modify satellite cluster settings</DialogDescription>
            </DialogHeader>
            <SatelliteClusterForm initialValues={editingItem} onSubmit={handleUpdate} isLoading={updateMutation.isPending} mode="edit" />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && onDeleteItemChange(null)}
        title="Delete Satellite Cluster"
        description={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}

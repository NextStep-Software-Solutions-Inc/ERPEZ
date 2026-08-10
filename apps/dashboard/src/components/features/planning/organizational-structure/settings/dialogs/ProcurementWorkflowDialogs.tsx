import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { ProcurementWorkflowForm } from '@/components/features/planning/organizational-structure/settings/forms/ProcurementWorkflowForm'
import {
  useCreateProcurementWorkflow,
  useUpdateProcurementWorkflow,
  useDeleteProcurementWorkflow,
} from '@/pages/planning/organization/hooks/useSettings'
import type { ProcurementWorkflowSetting, ProcurementWorkflowFormValues } from '@/components/features/planning/organizational-structure/types'

interface ProcurementWorkflowDialogsProps {
  createOpen: boolean
  onCreateOpenChange: (open: boolean) => void
  editingItem: ProcurementWorkflowSetting | null
  onEditingItemChange: (item: ProcurementWorkflowSetting | null) => void
  deleteItem: ProcurementWorkflowSetting | null
  onDeleteItemChange: (item: ProcurementWorkflowSetting | null) => void
}

export function ProcurementWorkflowDialogs({
  createOpen,
  onCreateOpenChange,
  editingItem,
  onEditingItemChange,
  deleteItem,
  onDeleteItemChange,
}: ProcurementWorkflowDialogsProps) {
  const createMutation = useCreateProcurementWorkflow()
  const updateMutation = useUpdateProcurementWorkflow()
  const deleteMutation = useDeleteProcurementWorkflow()

  const handleCreate = async (values: ProcurementWorkflowFormValues) => {
    await createMutation.mutateAsync({ pathParams: {}, payload: values })
    onCreateOpenChange(false)
  }

  const handleUpdate = async (values: ProcurementWorkflowFormValues) => {
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
            <DialogTitle>Create Procurement Workflow</DialogTitle>
            <DialogDescription>Add a new procurement workflow configuration</DialogDescription>
          </DialogHeader>
          <ProcurementWorkflowForm onSubmit={handleCreate} isLoading={createMutation.isPending} mode="create" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && onEditingItemChange(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Procurement Workflow</DialogTitle>
              <DialogDescription>Modify procurement workflow configuration</DialogDescription>
            </DialogHeader>
            <ProcurementWorkflowForm initialValues={editingItem} onSubmit={handleUpdate} isLoading={updateMutation.isPending} mode="edit" />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && onDeleteItemChange(null)}
        title="Delete Procurement Workflow"
        description={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}

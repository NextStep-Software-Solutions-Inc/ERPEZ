import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { SalaryGradeForm } from '@/components/features/planning/organizational-structure/settings/forms/SalaryGradeForm'
import {
  useCreateSalaryGrade,
  useUpdateSalaryGrade,
  useDeleteSalaryGrade,
} from '@/pages/planning/organization/hooks/useSettings'
import type { SalaryGradeSetting, SalaryGradeFormValues } from '@/components/features/planning/organizational-structure/types'

interface SalaryGradeDialogsProps {
  createOpen: boolean
  onCreateOpenChange: (open: boolean) => void
  editingItem: SalaryGradeSetting | null
  onEditingItemChange: (item: SalaryGradeSetting | null) => void
  deleteItem: SalaryGradeSetting | null
  onDeleteItemChange: (item: SalaryGradeSetting | null) => void
}

export function SalaryGradeDialogs({
  createOpen,
  onCreateOpenChange,
  editingItem,
  onEditingItemChange,
  deleteItem,
  onDeleteItemChange,
}: SalaryGradeDialogsProps) {
  const createMutation = useCreateSalaryGrade()
  const updateMutation = useUpdateSalaryGrade()
  const deleteMutation = useDeleteSalaryGrade()

  const handleCreate = async (values: SalaryGradeFormValues) => {
    await createMutation.mutateAsync({ pathParams: {}, payload: values })
    onCreateOpenChange(false)
  }

  const handleUpdate = async (values: SalaryGradeFormValues) => {
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
            <DialogTitle>Create Salary Grade</DialogTitle>
            <DialogDescription>Add a new salary grade to your organization structure</DialogDescription>
          </DialogHeader>
          <SalaryGradeForm onSubmit={handleCreate} isLoading={createMutation.isPending} mode="create" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && onEditingItemChange(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Salary Grade</DialogTitle>
              <DialogDescription>Modify salary grade settings</DialogDescription>
            </DialogHeader>
            <SalaryGradeForm initialValues={editingItem} onSubmit={handleUpdate} isLoading={updateMutation.isPending} mode="edit" />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && onDeleteItemChange(null)}
        title="Delete Salary Grade"
        description={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}

/**
 * Delete Activity Type Dialog
 * Confirmation dialog for deleting activity type definitions
 * Uses Jotai atom for state management
 * Location: src/features/planning/market-scoping/dialogs/
 */

import { useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { selectedActivityTypeForDeleteAtom, activityTypesAtom } from '../atoms/managementStateAtoms'
import { deleteActivityTypeRequest } from '../handlers/getActivityTypesRequest'

interface DeleteActivityTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteActivityTypeDialog({
  open,
  onOpenChange,
}: DeleteActivityTypeDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const targetActivity = useAtomValue(selectedActivityTypeForDeleteAtom)
  const clearSelected = useSetAtom(selectedActivityTypeForDeleteAtom)
  const setActivityTypes = useSetAtom(activityTypesAtom)
  const deleteActivityType = createMutationHookFromTemplate(
    deleteActivityTypeRequest(targetActivity?.id ?? '')
  )()

  if (!targetActivity) {
    return null
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteActivityType.mutateAsync({ pathParams: { id: targetActivity.id } })
      setActivityTypes((prev) => prev.filter((item) => item.id !== targetActivity.id))
      toast.success(`Activity type "${targetActivity.label}" deleted successfully.`)
      onOpenChange(false)
      clearSelected(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <ConfirmAlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Activity Type"
      description={`Are you sure you want to delete "${targetActivity.label}"? This action cannot be undone.`}
      confirmLabel="Delete"
      cancelLabel="Cancel"
      loading={isDeleting}
      onConfirm={handleDelete}
      onCancel={() => {
        onOpenChange(false)
        clearSelected(null)
      }}
    />
  )
}
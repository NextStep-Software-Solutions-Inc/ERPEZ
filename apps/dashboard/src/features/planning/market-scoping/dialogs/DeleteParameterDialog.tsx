/**
 * Delete Parameter Dialog
 * Confirmation dialog for deleting parameter definitions
 * Uses Jotai atom for state management
 * Location: src/features/planning/market-scoping/dialogs/
 */

import { useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import {
  selectedParameterForDeleteAtom,
  parametersAtom,
} from '../atoms/managementStateAtoms'
import { deleteParameterRequest } from '../handlers/getParametersRequest'

interface DeleteParameterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteParameterDialog({
  open,
  onOpenChange,
}: DeleteParameterDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const targetParameter = useAtomValue(selectedParameterForDeleteAtom)
  const clearSelected = useSetAtom(selectedParameterForDeleteAtom)
  const setParameters = useSetAtom(parametersAtom)
  const deleteParameter = createMutationHookFromTemplate(
    deleteParameterRequest(targetParameter?.id ?? ''),
  )()

  if (!targetParameter) {
    return null
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteParameter.mutateAsync({
        pathParams: { id: targetParameter.id },
      })
      setParameters((prev) =>
        prev.filter((item) => item.id !== targetParameter.id),
      )
      toast.success(
        `Parameter "${targetParameter.displayName}" deleted successfully.`,
      )
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
      title="Delete Parameter"
      description={`Are you sure you want to delete "${targetParameter.displayName}"? This action cannot be undone.`}
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

/**
 * DeletePpmpDialog
 * Confirmation alert for deleting a Draft or Rejected PPMP.
 */

import { useState } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { deletePpmpDialogOpenAtom, selectedPpmpForDeleteAtom } from '../atoms'
import { deletePpmpRequest } from '../handlers'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'

const useDeletePpmp = createMutationHookFromTemplate(deletePpmpRequest)
interface DeletePpmpDialogProps {
  onSuccess?: () => void
}

export function DeletePpmpDialog({ onSuccess }: DeletePpmpDialogProps) {
  const [open, setOpen] = useAtom(deletePpmpDialogOpenAtom)
  const target = useAtomValue(selectedPpmpForDeleteAtom)
  const clearTarget = useSetAtom(selectedPpmpForDeleteAtom)
  const [isLoading, setIsLoading] = useState(false)
  const { mutateAsync } = useDeletePpmp()

  const handleConfirm = async () => {
    if (!target) return
    setIsLoading(true)
    try {
      await toast.promise(
        mutateAsync(
          { pathParams: { id: target.id } },
          {
            onSuccess: () => {
              onSuccess?.()
              handleClose()
            },
          },
        ),
        {
          loading: 'Deleting PPMP...',
          success: `PPMP "${target.documentName}" deleted successfully!`,
          error: (err) =>
            err instanceof Error ? err.message : 'Failed to delete PPMP.',
        },
      )
    } catch {
      // toast.promise handles presentation
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    clearTarget(null)
    setOpen(false)
  }

  return (
    <ConfirmAlertDialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose()
      }}
      title="Delete PPMP?"
      description={
        target
          ? `"${target.documentName || target.ppmpNumber}" will be permanently deleted. This action cannot be undone.`
          : 'This PPMP will be permanently deleted.'
      }
      onConfirm={handleConfirm}
      onCancel={handleClose}
      confirmLabel={isLoading ? 'Deleting…' : 'Delete'}
      cancelLabel="Cancel"
      loading={isLoading}
    />
  )
}

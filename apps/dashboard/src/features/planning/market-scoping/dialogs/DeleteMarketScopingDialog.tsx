/**
 * DeleteMarketScopingDialog
 * Confirmation alert for deleting a Draft market scoping form.
 * Demonstrates dialog + confirmation pattern for destructive actions.
 * Location: src/features/planning/market-scoping/dialogs/
 */

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import {
  deleteMarketScopingDialogOpenAtom,
  selectedMarketScopingForDeleteAtom,
} from '../atoms/marketScopingStateAtom'
import { useDeleteMarketScoping } from '../hooks/useDeleteMarketScoping'

interface DeleteMarketScopingDialogProps {
  projectName?: string
  onSuccess?: () => void
}

export function DeleteMarketScopingDialog({
  projectName,
  onSuccess,
}: DeleteMarketScopingDialogProps) {
  const [open, setOpen] = useAtom(deleteMarketScopingDialogOpenAtom)
  const targetId = useAtomValue(selectedMarketScopingForDeleteAtom)
  const clearTarget = useSetAtom(selectedMarketScopingForDeleteAtom)
  const { mutate: deleteMarketScoping, isPending: isLoading } =
    useDeleteMarketScoping()

  const handleConfirm = async () => {
    if (!targetId) return
    deleteMarketScoping(
      {
        pathParams: { id: targetId },
      },
      {
        onSuccess: () => {
          toast.success(
            projectName
              ? `Market Scoping "${projectName}" deleted successfully.`
              : 'Market Scoping form deleted successfully.',
          )
          onSuccess?.()
          handleClose()
        },
        onError: (err) => {
          console.error('Delete error:', err)
          toast.error(
            err instanceof Error
              ? err.message
              : 'Failed to delete market scoping form.',
          )
        },
      },
    )
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
      title="Delete Market Scoping Form?"
      description={
        projectName
          ? `"${projectName}" will be permanently deleted. This action cannot be undone.`
          : 'This market scoping form will be permanently deleted.'
      }
      onConfirm={handleConfirm}
      onCancel={handleClose}
      confirmLabel={isLoading ? 'Deleting…' : 'Delete'}
      cancelLabel="Cancel"
      loading={isLoading}
    />
  )
}

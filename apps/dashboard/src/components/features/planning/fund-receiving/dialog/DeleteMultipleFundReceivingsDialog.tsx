import { toast } from 'sonner'
import { useAtomValue, useSetAtom } from 'jotai'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import * as erpSharedLib from 'erpez-shared-lib'
import { deleteFundReceivingRequest } from '../handlers/deleteFundReceivingRequest'
import { closeDeleteMultipleDialogAtom, deleteMultipleDialogAtom } from '../atoms'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const { useQueryClient } = erpSharedLib
const useDeleteFundReceiving = createMutationHookFromTemplate(deleteFundReceivingRequest)

interface DeleteMultipleFundReceivingsDialogProps {
  onSuccess?: () => void
}

export default function DeleteMultipleFundReceivingsDialog({
  onSuccess,
}: DeleteMultipleFundReceivingsDialogProps) {
  const { mutateAsync, isPending } = useDeleteFundReceiving()
  const dialogState = useAtomValue(deleteMultipleDialogAtom)
  const closeDialog = useSetAtom(closeDeleteMultipleDialogAtom)
  const queryClient = useQueryClient()

  // Don't render if no IDs are selected
  if (!dialogState.selectedIds.length) {
    return null
  }

  const onDelete = async () => {
    try {
      // Delete all selected received funds
      await Promise.all(
        dialogState.selectedIds.map(id =>
          mutateAsync({ pathParams: { id } })
        )
      )

      // Invalidate queries after all deletions
      void queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0]
          return typeof key === 'string' && (
            key.startsWith('/received-funds') ||
            key.startsWith('/fund-sources')
          )
        },
      })

      onSuccess?.()
      closeDialog()

      toast.success(`Successfully deleted ${dialogState.selectedIds.length} received fund(s)`)
    } catch (error) {
      toast.error('Failed to delete some received funds')
    }
  }

  const handleCancelDelete = () => {
    void queryClient.cancelQueries({
      queryKey: ['/received-funds'],
    })
    closeDialog()
  }

  return (
    <ConfirmAlertDialog
      loading={isPending}
      onConfirm={onDelete}
      onCancel={handleCancelDelete}
      open={dialogState.isOpen}
      onOpenChange={(open) => !open && closeDialog()}
      title={`Are you absolutely sure want to delete ${dialogState.selectedIds.length} received funds(s)?`}
      description="This action cannot be undone. This will permanently delete the selected records from the server."
    />
  )
}
import { toast } from 'sonner'
import { useAtomValue, useSetAtom } from 'jotai'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import * as erpSharedLib from 'erpez-shared-lib'
import { deleteFundReceivingRequest } from '../handlers/deleteFundReceivingRequest'
import { closeDeleteDialogAtom, deleteDialogAtom } from '../atoms'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const { useQueryClient } = erpSharedLib
const useDeleteFundReceiving = createMutationHookFromTemplate(
  deleteFundReceivingRequest,
)

interface DeleteFundReceivingDialogProps {
  onSuccess?: () => void
}

export default function DeleteFundReceivingDialog({
  onSuccess,
}: DeleteFundReceivingDialogProps) {
  const { mutateAsync, isPending } = useDeleteFundReceiving()
  const dialogState = useAtomValue(deleteDialogAtom)
  const closeDialog = useSetAtom(closeDeleteDialogAtom)
  const queryClient = useQueryClient()

  // Don't render if no ID is selected
  if (!dialogState.selectedId) {
    return null
  }

  const onDelete = () => {
    if (!dialogState.selectedId) return
    toast.promise(
      mutateAsync(
        { pathParams: { id: dialogState.selectedId } },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) => {
                const key = query.queryKey[0]
                return (
                  typeof key === 'string' &&
                  (key.startsWith('/received-funds') ||
                    key.startsWith('/fund-sources'))
                )
              },
            })
          },
        },
      ),
      {
        loading: 'Deleting fund receiving...',
        success: (res) => {
          onSuccess?.()
          closeDialog()
          return res.message || 'Receiving fund deleted successfully'
        },
        error: 'Failed to delete receiving fund.',
      },
    )
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
      title="Are you absolutely sure you want to delete this receive fund?"
      description="This action cannot be undone. This will permanently delete the record from the server."
    />
  )
}
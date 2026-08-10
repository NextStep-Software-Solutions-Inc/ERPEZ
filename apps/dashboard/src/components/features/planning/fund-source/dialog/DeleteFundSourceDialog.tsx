import { toast } from 'sonner'
import { useAtomValue, useSetAtom } from 'jotai'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import * as erpSharedLib from 'erpez-shared-lib'
import { deleteFundSourceRequest } from '../handlers/deleteFundSourceRequest'
import { closeDeleteDialogAtom, deleteDialogAtom } from '../atoms'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const { useQueryClient } = erpSharedLib
const useDeleteFundSource = createMutationHookFromTemplate(
  deleteFundSourceRequest,
)

interface DeleteFundSourceDialogProps {
  onSuccess?: () => void
}

export default function DeleteFundSourceDialog({
  onSuccess,
}: DeleteFundSourceDialogProps) {
  const { mutateAsync, isPending } = useDeleteFundSource()
  const dialogState = useAtomValue(deleteDialogAtom)
  const closeDialog = useSetAtom(closeDeleteDialogAtom)
  const queryClient = useQueryClient()

  // Don't render if no ID is selected
  if (!dialogState.selectedId) {
    return null
  }
  const onDelete = () => {
    toast.promise(
      mutateAsync(
        { pathParams: { id: dialogState.selectedId! } },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                query.queryKey[0].startsWith('/fund-sources'),
            })
          },
        },
      ),
      {
        loading: 'Deleting fund source...',
        success: (res) => {
          onSuccess?.()
          closeDialog()
          return res.message || 'Fund source deleted successfully'
        },
        error: 'Failed to delete fund source.',
      },
    )
  }

  const handleCancelDelete = () => {
    void queryClient.cancelQueries({
      queryKey: ['/fund-sources'],
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
      title="Are you absolutely sure you want to delete this fund source?"
      description="This action cannot be undone. This will permanently delete the record from the server."
    />
  )
}

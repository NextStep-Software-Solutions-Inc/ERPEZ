import { toast } from 'sonner'
import { useAtomValue, useSetAtom } from 'jotai'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import * as erpSharedLib from 'erpez-shared-lib'
import { deleteFundSourceRequest } from '../handlers/deleteFundSourceRequest'
import {
  closeDeleteMultipleDialogAtom,
  deleteMultipleDialogAtom,
} from '../atoms'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const { useQueryClient } = erpSharedLib
const useDeleteFundSource = createMutationHookFromTemplate(
  deleteFundSourceRequest,
)

interface DeleteMultipleFundSourcesDialogProps {
  onSuccess?: () => void
}

export default function DeleteMultipleFundSourcesDialog({
  onSuccess,
}: DeleteMultipleFundSourcesDialogProps) {
  const { mutateAsync, isPending } = useDeleteFundSource()
  const dialogState = useAtomValue(deleteMultipleDialogAtom)
  const closeDialog = useSetAtom(closeDeleteMultipleDialogAtom)
  const queryClient = useQueryClient()

  // Don't render if no IDs are selected
  if (!dialogState.selectedIds.length) {
    return null
  }

  const onDelete = async () => {
    try {
      // Delete all selected fund sources
      await Promise.all(
        dialogState.selectedIds.map((id) =>
          mutateAsync({ pathParams: { id } }),
        ),
      )

      // Invalidate queries after all deletions
      void queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === '/fund-sources',
      })

      onSuccess?.()
      closeDialog()

      toast.success(
        `Successfully deleted ${dialogState.selectedIds.length} fund source(s)`,
      )
    } catch (error) {
      toast.error('Failed to delete some fund sources')
    }
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
      title={`Are you absolutely sure you want to delete ${dialogState.selectedIds.length} fund source(s)?`}
      description="This action cannot be undone. This will permanently delete the selected records from the server."
    />
  )
}

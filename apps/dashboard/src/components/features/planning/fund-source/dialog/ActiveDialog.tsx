import { toast } from 'sonner'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { updateFundSourceRequest } from '../handlers/updateFundSourceRequest'
import { activeDialogAtom, closeActiveDialogAtom } from '../atoms'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const useUpdateFundSource = createMutationHookFromTemplate(
  updateFundSourceRequest,
)

interface ActiveDialogProps {
  onSuccess?: () => void
}

export default function ActiveDialog({ onSuccess }: ActiveDialogProps) {
  const { mutateAsync, isPending } = useUpdateFundSource()
  const dialogState = useAtomValue(activeDialogAtom)
  const closeDialog = useSetAtom(closeActiveDialogAtom)
  const queryClient = useQueryClient()

  // Don't render if no fund source is selected
  if (!dialogState.selectedFundSource) {
    return null
  }

  const onActivate = () => {
    const fundSource = dialogState.selectedFundSource
    if (!fundSource) return

    toast.promise(
      mutateAsync(
        {
          pathParams: { id: fundSource.id },
          queryParams: {},
          payload: {
            name: fundSource.name,
            code: fundSource.code,
            type: fundSource.type,
            isActive: true,
            parentId: fundSource.parentId || undefined,
          },
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                query.queryKey[0].startsWith('/fund-sources'),
            })
            onSuccess?.()
            closeDialog()
          },
        },
      ),
      {
        loading: 'Activating fund source...',
        success: (res) => {
          return res.message || 'Fund source activated successfully'
        },
        error: 'Failed to activate fund source.',
      },
    )
  }

  const handleCancel = () => {
    void queryClient.cancelQueries({
      queryKey: ['/fund-sources'],
    })
    closeDialog()
  }

  return (
    <ConfirmAlertDialog
      loading={isPending}
      onConfirm={onActivate}
      onCancel={handleCancel}
      open={dialogState.isOpen}
      onOpenChange={(open) => !open && closeDialog()}
      title="Activate Fund Source?"
      description={`Are you sure you want to activate "${dialogState.selectedFundSource.name}"? This will make the fund source available for allocation.`}
      confirmLabel="Activate"
      cancelLabel="Cancel"
    />
  )
}

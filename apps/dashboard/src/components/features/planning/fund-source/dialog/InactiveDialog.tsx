import { toast } from 'sonner'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { updateFundSourceRequest } from '../handlers/updateFundSourceRequest'
import { closeInactiveDialogAtom, inactiveDialogAtom } from '../atoms'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const useUpdateFundSource = createMutationHookFromTemplate(
  updateFundSourceRequest,
)

interface InactiveDialogProps {
  onSuccess?: () => void
}

export default function InactiveDialog({ onSuccess }: InactiveDialogProps) {
  const { mutateAsync, isPending } = useUpdateFundSource()
  const dialogState = useAtomValue(inactiveDialogAtom)
  const closeDialog = useSetAtom(closeInactiveDialogAtom)
  const queryClient = useQueryClient()

  // Don't render if no fund source is selected
  if (!dialogState.selectedFundSource) {
    return null
  }

  const onInactivate = () => {
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
            isActive: false,
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
        loading: 'Inactivating fund source...',
        success: (res) => {
          return res.message || 'Fund source inactivated successfully'
        },
        error: 'Failed to inactivate fund source.',
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
      onConfirm={onInactivate}
      onCancel={handleCancel}
      open={dialogState.isOpen}
      onOpenChange={(open) => !open && closeDialog()}
      title="Inactivate Fund Source?"
      description={`Are you sure you want to inactivate "${dialogState.selectedFundSource.name}"? This will prevent the fund source from being used in allocations.`}
      confirmLabel="Inactivate"
      cancelLabel="Cancel"
    />
  )
}

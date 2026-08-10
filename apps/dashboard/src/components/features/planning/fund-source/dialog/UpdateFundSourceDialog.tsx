import { Activity } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import UpdateFundSourceForm from '../form/UpdateFundSourceForm'
import { updateFundSourceRequest } from '../handlers/updateFundSourceRequest'
import { getFundSourceRequest } from '../handlers/getFundSourceRequest'
import {
  closeUpdateDialogAtom,
  hasUnsavedUpdateFormAtom,
  updateDialogAtom,
  updateFormDataAtom,
} from '../atoms'
import type { UpdateFundSourceType } from '../form/UpdateFundSourceForm'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

interface UpdateFundSourceDialogProps {
  onUpdated?: (data: UpdateFundSourceType) => void
}

const useUpdateFundSource = createMutationHookFromTemplate(
  updateFundSourceRequest,
)
const useFundSource = createQueryHookFromTemplate(getFundSourceRequest)

export default function UpdateFundSourceDialog({
  onUpdated,
}: UpdateFundSourceDialogProps) {
  const { mutateAsync } = useUpdateFundSource()
  const [dialogState, setDialogState] = useAtom(updateDialogAtom)
  const formData = useAtomValue(updateFormDataAtom)
  const closeDialog = useSetAtom(closeUpdateDialogAtom)
  const hasUnsavedChanges = useAtomValue(hasUnsavedUpdateFormAtom)
  const queryClient = useQueryClient()

  // Fetch the selected fund source
  const { data: fundSource } = useFundSource({
    pathParams: { id: dialogState.selectedId || '' },
    queryParams: {},
  })

  const handleUpdateFundSource = (data: UpdateFundSourceType) => {
    if (!dialogState.selectedId) return

    toast.promise(
      mutateAsync(
        {
          pathParams: { id: dialogState.selectedId },
          queryParams: {},
          payload: data,
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                query.queryKey[0].startsWith('/fund-sources'),
            })
            onUpdated?.(data)
            closeDialog(true) // Clear form on successful update
          },
        },
      ),
      {
        loading: 'Updating fund source...',
        success: 'Fund source updated successfully!',
        error: 'Failed to update fund source',
      },
    )
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setDialogState({ showUnsavedWarning: true })
    } else {
      closeDialog(true)
    }
  }

  const handleConfirmClose = () => {
    closeDialog(true)
    setDialogState({ showUnsavedWarning: false })
  }

  const handleCancelClose = () => {
    setDialogState({ showUnsavedWarning: false })
  }

  return (
    <>
      <Activity mode={dialogState.showUnsavedWarning ? 'hidden' : 'visible'}>
        <ResponsiveDialog
          open={dialogState.isOpen}
          onOpenChange={(open) =>
            open ? setDialogState({ isOpen: true }) : handleClose()
          }
          title="Edit Fund Source"
        >
          {fundSource?.data && (
            <UpdateFundSourceForm
              onSubmit={handleUpdateFundSource}
              onCancel={handleClose}
              currentId={dialogState.selectedId || undefined}
              currentData={fundSource.data}
              initialValues={{
                name: fundSource.data.name,
                code: fundSource.data.code,
                category: fundSource.data.category,
                type: fundSource.data.type,
                isActive: fundSource.data.isActive,
                fundCluster: fundSource.data.fundCluster,
                authorization: fundSource.data.authorization,
                ...formData,
              }}
            />
          )}
        </ResponsiveDialog>
      </Activity>
      <Activity mode={dialogState.showUnsavedWarning ? 'visible' : 'hidden'}>
        <ConfirmAlertDialog
          open={dialogState.showUnsavedWarning}
          onOpenChange={handleCancelClose}
          title="Unsaved Changes"
          description="You have unsaved changes that will be lost. Are you sure you want to continue?"
          onConfirm={handleConfirmClose}
          confirmLabel="Discard Changes"
          cancelLabel="Keep Editing"
        />
      </Activity>
    </>
  )
}

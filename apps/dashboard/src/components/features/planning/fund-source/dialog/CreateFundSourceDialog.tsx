import { Activity } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { createFundSourceRequest } from '../handlers/createFundSourceRequest'
import CreateFundSourceForm from '../form/CreateFundSourceForm'
import {
  closeCreateDialogAtom,
  createDialogAtom,
  createFormDataAtom,
  hasUnsavedCreateFormAtom,
} from '../atoms'
import type { CreateFundSourceFormValues } from '../form/CreateFundSourceForm'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

interface CreateFundSourceDialogProps {
  onCreated?: (data: CreateFundSourceFormValues) => void
}

const useCreateFundSource = createMutationHookFromTemplate(
  createFundSourceRequest,
)
export default function CreateFundSourceDialog({
  onCreated,
}: CreateFundSourceDialogProps) {
  const { mutateAsync } = useCreateFundSource()
  const [dialogState, setDialogState] = useAtom(createDialogAtom)
  const formData = useAtomValue(createFormDataAtom)
  const closeDialog = useSetAtom(closeCreateDialogAtom)
  const hasUnsavedChanges = useAtomValue(hasUnsavedCreateFormAtom)
  const queryClient = useQueryClient()
  const handleCreateFundSource = (data: CreateFundSourceFormValues) => {
    const payload = { ...data, parentId: data.parentId ?? null }

    toast.promise(
      mutateAsync(
        {
          pathParams: {},
          payload,
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                query.queryKey[0].startsWith('/fund-sources'),
            })
            onCreated?.(data)
            closeDialog(true)
          },
        },
      ),
      {
        loading: 'Creating Fund Source...',
        success: 'Fund Source created successfully!',
        error: 'Failed to create Fund Source.',
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
          title="Create Fund Source"
          description="Fund Source Details"
        >
          <CreateFundSourceForm
            onSubmit={(data) => handleCreateFundSource(data)}
            onCancel={handleClose}
            initialValues={formData}
          />
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

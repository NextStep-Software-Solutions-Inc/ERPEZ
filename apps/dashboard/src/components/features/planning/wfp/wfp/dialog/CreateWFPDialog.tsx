import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
// import { useParams } from '@tanstack/react-router'
import { createWFPRequest } from '../handlers/createWFPRequest'
import {
  closeCreateDialogAtom,
  createDialogAtom,
  createFormDataAtom,
  hasUnsavedCreateFormAtom,
} from '../atoms'
import CreateWFPForm from '../form/CreateWFPForm'
import type { CreateWFPFormValues } from '../form/CreateWFPForm';
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

interface CreateWFPDialogProps {
  onCreated?: (data: CreateWFPFormValues) => void
}

const useCreateWFP = createMutationHookFromTemplate(createWFPRequest)

export default function CreateWFPDialog({ onCreated }: CreateWFPDialogProps) {
  // const deliveryUnitId = useParams({ from: '/v2/$deliveryUnitId/wfp' }).deliveryUnitId
  const { mutateAsync } = useCreateWFP()
  const [dialogState, setDialogState] = useAtom(createDialogAtom)
  const formData = useAtomValue(createFormDataAtom)
  const queryClient = useQueryClient()
  const closeDialog = useSetAtom(closeCreateDialogAtom)
  const hasUnsavedChanges = useAtomValue(hasUnsavedCreateFormAtom)

  const { isOpen, showUnsavedWarning } = dialogState
  const dialogTitle = 'Create Work and Financial Plan'
  const dialogDescription = 'Enter the details to initialize a new WFP.'

  const sanitizedInitialValues = useMemo(() => {
    return { ...formData } as Partial<CreateWFPFormValues>
  }, [formData])

  const handleCreateWFP = (data: CreateWFPFormValues) => {
    const { fiscalYearId, proposedBudget, description, ...payload } = data
    toast.promise(
      mutateAsync(
        {
          pathParams: {},
          payload,
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) => query.queryKey.some(key => 
                typeof key === 'string' && key.startsWith('/wfps')
              ),
            })
            onCreated?.(data)
            closeDialog(true)
          },
        },
      ),
      {
        loading: 'Creating WFP...',
        success: 'WFP created successfully!',
        error: 'Failed to create WFP.',
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

  // Prevent dialog from closing if there are unsaved changes
  const handleDialogOpenChange = (open: boolean) => {
    if (!open && hasUnsavedChanges) {
      // Show confirmation instead of closing
      setDialogState({ showUnsavedWarning: true })
      return
    }
    if (!open) {
      // Safe to close
      closeDialog(true)
    }
  }

  const handleConfirmDiscard = () => {
    closeDialog(true)
  }

  const handleCancelUnsavedWarning = () => {
    setDialogState({ showUnsavedWarning: false })
  }

  return (
    <>
      <ResponsiveDialog
        open={isOpen}
        onOpenChange={handleDialogOpenChange}
        title={dialogTitle}
        description={dialogDescription}
        showCloseButton={true}
      >
        <CreateWFPForm
          onSubmit={handleCreateWFP}
          onCancel={handleClose}
          // deliveryUnitId={deliveryUnitId}
          initialValues={sanitizedInitialValues}
        />
      </ResponsiveDialog>

      <ConfirmAlertDialog
        open={showUnsavedWarning}
        onOpenChange={(open) =>
          !open && handleCancelUnsavedWarning()
        }
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to discard them?"
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
        onConfirm={handleConfirmDiscard}
        onCancel={handleCancelUnsavedWarning}
      />
    </>
  )
}

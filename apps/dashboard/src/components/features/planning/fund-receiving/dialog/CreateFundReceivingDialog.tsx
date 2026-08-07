import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Activity, useMemo } from 'react'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { createFundReceivingRequest } from '../handlers/createFundReceivingRequest.ts'
import CreateFundReceivingForm from '../form/CreateFundReceivingForm.tsx'
import {
  closeCreateDialogAtom,
  createDialogAtom,
  createFormDataAtom,
  hasUnsavedCreateFormAtom,
} from '../atoms.ts'
import type { CreateFundReceivingFormValues } from '../form/CreateFundReceivingForm.tsx'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { getTodayDateString } from '@/utils/formatters.ts'

interface CreateFundReceivingDialogProps {
  onCreated?: (data: CreateFundReceivingFormValues) => void
}

const useCreateFundReceiving = createMutationHookFromTemplate(
  createFundReceivingRequest,
)

export default function CreateFundReceivingDialog({
  onCreated,
}: CreateFundReceivingDialogProps) {
  const { mutateAsync } = useCreateFundReceiving()
  const [dialogState, setDialogState] = useAtom(createDialogAtom)
  const formData = useAtomValue(createFormDataAtom)
  const queryClient = useQueryClient()
  const closeDialog = useSetAtom(closeCreateDialogAtom)
  const hasUnsavedChanges = useAtomValue(hasUnsavedCreateFormAtom)

  const { isOpen, mode, initialFundSourceId, showUnsavedWarning } = dialogState
  const dialogTitle =
    mode === 'add' ? 'Add Received Fund' : 'Create Received Fund'
  const dialogDescription = 'Enter the details for the received fund.'

  const sanitizedInitialValues = useMemo(() => {
    const cleanedData = { ...formData }
    if (mode === 'add' && initialFundSourceId) {
      cleanedData.fundSourceId = initialFundSourceId
    }

    if (typeof cleanedData.amount === 'string') {
      const normalized = cleanedData.amount.replace(/,/g, '')
      const numericValue = parseFloat(normalized)

      cleanedData.amount =
        isNaN(numericValue) || !isFinite(numericValue) ? 0 : numericValue
    }

    if (
      !cleanedData.description ||
      typeof cleanedData.description !== 'string'
    ) {
      cleanedData.description = ''
    }

    if (!cleanedData.receivedDate) {
      cleanedData.receivedDate = getTodayDateString()
    }

    return cleanedData as Partial<CreateFundReceivingFormValues>
  }, [formData, mode, initialFundSourceId])

  const handleCreateFundReceiving = (data: CreateFundReceivingFormValues) => {
    toast.promise(
      mutateAsync(
        {
          pathParams: {},
          payload: data,
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) => query.queryKey[0] === '/received-funds',
            })
            onCreated?.(data)
            closeDialog(true)
          },
        },
      ),
      {
        loading: 'Creating Receive Fund...',
        success: 'Receive Fund created successfully!',
        error: 'Failed to create Receive Fund.',
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
    setDialogState({ showUnsavedWarning: false })
    closeDialog(true)
  }

  const handleCancelClose = () => {
    setDialogState({ showUnsavedWarning: false })
  }

  return (
    <>
      <Activity mode={showUnsavedWarning ? 'hidden' : 'visible'}>
        <ResponsiveDialog
          open={isOpen}
          onOpenChange={(open) =>
            open ? setDialogState({ isOpen: true }) : handleClose()
          }
          title={dialogTitle}
          description={dialogDescription}
        >
          <CreateFundReceivingForm
            onSubmit={(data) => handleCreateFundReceiving(data)}
            onCancel={handleClose}
            initialValues={sanitizedInitialValues}
            currentMode={mode}
          />
        </ResponsiveDialog>
      </Activity>
      <Activity mode={showUnsavedWarning ? 'visible' : 'hidden'}>
        <ConfirmAlertDialog
          open={showUnsavedWarning}
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

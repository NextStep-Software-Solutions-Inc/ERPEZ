import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import {
  closeCreateDialogAtom,
  createDialogAtom,
  createFormDataAtom,
  hasUnsavedCreateFormAtom,
} from '../atoms'
import CreateWFPObjectiveTargetForm from '../form/CreateWFPObjectiveTargetForm'
import { createWFPObjectiveTargetRequest } from '../handlers/createWFPObjectiveTargetRequest'
import type { CreateWFPObjectiveTargetValues } from '../form/CreateWFPObjectiveTargetForm';
import type { WFPDetails } from '../../wfp/table/types'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

interface CreateWFPObjectiveTargetDialogProps {
  onCreated?: (data: CreateWFPObjectiveTargetValues) => void
  wfpObjectiveId?: string
  wfpData?: WFPDetails
}

const useCreateWFPObjectiveTarget = createMutationHookFromTemplate(createWFPObjectiveTargetRequest)

export default function CreateWFPObjectiveTargetDialog({ onCreated, wfpObjectiveId, wfpData}: CreateWFPObjectiveTargetDialogProps) {
  const { mutateAsync } = useCreateWFPObjectiveTarget()
  const [dialogState, setDialogState] = useAtom(createDialogAtom)
  const formData = useAtomValue(createFormDataAtom)
  const queryClient = useQueryClient()
  const closeDialog = useSetAtom(closeCreateDialogAtom)
  const hasUnsavedChanges = useAtomValue(hasUnsavedCreateFormAtom)

  const { isOpen, showUnsavedWarning } = dialogState
  const dialogTitle = 'Create Activity'
  const dialogDescription = 'Fill in the details to create a new Activity.'

  const sanitizedInitialValues = useMemo(() => {
    return { ...formData } as Partial<CreateWFPObjectiveTargetValues>
  }, [formData])

  const handleCreateWFPObjectiveTarget = (data: CreateWFPObjectiveTargetValues) => {
    
    toast.promise(
      mutateAsync(
        {
          pathParams: {},
          payload: data,
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) => query.queryKey.some(key => 
                typeof key === 'string' && (key.includes('/wfp-objective-activities') || key.includes('/wfp-objectives'))
              ),
            })
            onCreated?.(data)
            // Reset form data in atom after successful creation
            setDialogState({ isOpen: false, showUnsavedWarning: false })
            closeDialog(true)
          },
        },
      ),
      {
        loading: 'Creating Activity...',
        success: 'Activity created successfully!',
        error: 'Failed to create Activity.',
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

  const handleConfirmDiscard = () => {
    closeDialog(true)
  }

  const handleCancelUnsavedWarning = () => {
    setDialogState({ showUnsavedWarning: false })
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

  return (
    <>
      <ResponsiveDialog
        open={isOpen}
        onOpenChange={handleDialogOpenChange}
        title={dialogTitle}
        description={dialogDescription}
      >
        <CreateWFPObjectiveTargetForm
          onSubmit={handleCreateWFPObjectiveTarget}
          onCancel={handleClose}
          initialValues={sanitizedInitialValues} wfpObjectiveId={wfpObjectiveId ?? ''} wfpData={wfpData} />
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

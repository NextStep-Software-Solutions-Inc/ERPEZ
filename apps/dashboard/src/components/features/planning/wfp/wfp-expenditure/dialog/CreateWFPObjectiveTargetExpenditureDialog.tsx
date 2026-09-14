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
import { createWFPObjectiveTargetExpenditureRequest } from '../handlers/createWFPObjectiveTargetExpenditureRequest'
import CreateWFPObjectiveTargetExpenditureForm from '../form/CreateWFPObjectiveTargetExpenditureForm'
import type { CreateWFPObjectiveTargetExpenditurePayload} from '../handlers/createWFPObjectiveTargetExpenditureRequest';
import type { CreateWFPObjectiveTargetExpenditureValues } from '../form/schema'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

interface CreateWFPObjectiveTargetExpenditureDialogProps {
  onCreated?: (data: CreateWFPObjectiveTargetExpenditureValues) => void
  wfpObjectiveId: string
}

const useCreateWFPObjectiveTargetExpenditure = createMutationHookFromTemplate(createWFPObjectiveTargetExpenditureRequest)

export default function CreateWFPObjectiveTargetExpenditureDialog({ onCreated, wfpObjectiveId}: CreateWFPObjectiveTargetExpenditureDialogProps) {
  const { mutateAsync } = useCreateWFPObjectiveTargetExpenditure()
  const [dialogState, setDialogState] = useAtom(createDialogAtom)
  const formData = useAtomValue(createFormDataAtom)
  const setCreateFormData = useSetAtom(createFormDataAtom)
  const queryClient = useQueryClient()
  const closeDialog = useSetAtom(closeCreateDialogAtom)
  const hasUnsavedChanges = useAtomValue(hasUnsavedCreateFormAtom)

  const { isOpen, showUnsavedWarning } = dialogState
  const dialogTitle = 'Create Expenditures'
  const dialogDescription = 'Define expenditure categories and add standardized expense items.'

  const sanitizedInitialValues = useMemo(() => {
    return formData && typeof formData === 'object' && 'expenditures' in formData ? formData : undefined
  }, [formData])

  const handleCreateWFPObjectiveTargetExpenditure = (data: CreateWFPObjectiveTargetExpenditureValues) => {
    if (data.expenditures.length === 0) {
      toast.error('Please select at least one item of expenditure.')
      return
    }

    const payload: CreateWFPObjectiveTargetExpenditurePayload = data.expenditures.flatMap((exp) =>
      exp.lineItems.flatMap((line: { objectId: string; items: Array<{ name: string; unitEstimates: number | null; quantity: number | null; subTotal: number | null; }> }) =>
        line.items.map((item) => ({
          objectId: line.objectId,
          quantity: item.quantity ?? 0,
          itemDescription: item.name,
          unitCost: item.unitEstimates ?? 0,
        }))
      )
    )

    toast.promise(
      mutateAsync(
        {
          pathParams: { wfpObjectiveTargetId: wfpObjectiveId },
          queryParams: { wfpObjectiveTargetId: wfpObjectiveId },
          payload,
        },
        {
          onSuccess: () => {
            // Refetch endpoints to ensure UI reflects new expenditure
            void queryClient.invalidateQueries({
              predicate: (query) => query.queryKey.some(key => 
                typeof key === 'string' && (
                  key.includes('/wfp-objective-activities') ||
                  key.includes('/wfp-objective-activity-expenditures') ||
                  key.includes('/wfps')
                )
              ),
            })
            onCreated?.(data)
            closeDialog(true)
          },
        },
      ),
      {
        loading: 'Create Expenditure...',
        success: 'Expenditure created successfully!',
        error: 'Failed to create Expenditure.',
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
        size="lg"
        onOpenChange={handleDialogOpenChange}
        title={dialogTitle}
        description={dialogDescription}
      >
        <CreateWFPObjectiveTargetExpenditureForm
          onSubmit={handleCreateWFPObjectiveTargetExpenditure}
          onCancel={handleClose}
          initialValues={sanitizedInitialValues}
          wfpObjectiveTargetId={wfpObjectiveId}
          onChange={setCreateFormData}
        />
      </ResponsiveDialog>

      <ConfirmAlertDialog
        open={showUnsavedWarning}
        onOpenChange={(open) =>
          !open && handleCancelUnsavedWarning()
        }
        title="Discard Changes?"
        description="You have unsaved changes that will be lost. Are you sure you want to close this dialog?"
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
        onConfirm={handleConfirmDiscard}
        onCancel={handleCancelUnsavedWarning}
      />
    </>
  )
}

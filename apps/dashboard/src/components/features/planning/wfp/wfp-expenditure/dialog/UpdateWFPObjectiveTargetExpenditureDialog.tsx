import { useEffect } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  closeUpdateDialogAtom,
  hasUnsavedUpdateFormAtom,
  updateDialogAtom,
  updateFormDataAtom,
} from '../atoms'
import { updateWFPObjectiveTargetExpenditureRequest } from '../handlers/updateWFPObjectiveTargetExpenditureRequest'
import { getWFPObjectiveTargetExpenditureRequest } from '../handlers/getWFPObjectiveTargetExpenditureRequest'
import UpdateWFPObjectiveTargetExpenditureForm from '../form/UpdateWFPObjectiveTargetExpenditureForm'
import type { UpdateWFPObjectiveTargetExpenditureValues } from '../form/UpdateWFPObjectiveTargetExpenditureForm';
import type { UpdateWFPObjectiveTargetExpenditurePayload } from '../handlers/updateWFPObjectiveTargetExpenditureRequest';
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

// Hooks updated to point to the Expenditure endpoints
const useUpdateWFPObjectiveTargetExpenditure = createMutationHookFromTemplate(updateWFPObjectiveTargetExpenditureRequest)
const useWFPObjectiveTargetExpenditure = createQueryHookFromTemplate(getWFPObjectiveTargetExpenditureRequest)

export default function UpdateWFPObjectiveTargetExpenditureDialog() {
  const { mutateAsync } = useUpdateWFPObjectiveTargetExpenditure()
  const [dialogState, setDialogState] = useAtom(updateDialogAtom)
  const setFormData = useSetAtom(updateFormDataAtom)
  const formData = useAtomValue(updateFormDataAtom)
  const hasUnsavedChangesValue = useAtomValue(hasUnsavedUpdateFormAtom)
  const closeDialog = useSetAtom(closeUpdateDialogAtom)
  const queryClient = useQueryClient()

  const selectedId = dialogState.selectedId || ''

  const { data: wfpObjectiveTargetExpenditureResponse, isLoading } = useWFPObjectiveTargetExpenditure({
    pathParams: { id: selectedId },
    queryParams: {},
  })

  const wfpObjectiveTargetExpenditureData = wfpObjectiveTargetExpenditureResponse?.data

  // Sync server data to Jotai atom for persistence/initialization
  useEffect(() => {
    if (wfpObjectiveTargetExpenditureData) {
      // Map API response directly to form structure
      setFormData({
        itemDescription: wfpObjectiveTargetExpenditureData.itemDescription || '',
        unitEstimates: wfpObjectiveTargetExpenditureData.unitCost || 0,
        quantity: wfpObjectiveTargetExpenditureData.quantity || 1,
      })
    }
  }, [wfpObjectiveTargetExpenditureData, setFormData, selectedId])

  const handleUpdate = (data: UpdateWFPObjectiveTargetExpenditureValues) => {
    const payload: UpdateWFPObjectiveTargetExpenditurePayload = {
      itemDescription: data.itemDescription,
      quantity: data.quantity,
      unitCost: data.unitEstimates,
    }

    toast.promise(
      mutateAsync(
        {
          pathParams: { id: selectedId },
          payload,
        },
        {
          onSuccess: () => {
            // Refetch endpoints to ensure UI reflects updated expenditure
            void queryClient.invalidateQueries({
              predicate: (query) => query.queryKey.some(key =>
                typeof key === 'string' && (
                  key.includes('/wfp-objective-activities') ||
                  key.includes('/wfp-objective-activity-expenditures') ||
                  key.includes('/wfps')
                )
              ),
            })
            closeDialog(true)
          },
        },
      ),
      {
        loading: 'Updating Expenditure...',
        success: 'Expenditure updated successfully!',
        error: 'Failed to update Expenditure.',
      },
    )
  }

  const handleClose = () => {
    if (hasUnsavedChangesValue) {
      setDialogState({ ...dialogState, showUnsavedWarning: true })
    } else {
      closeDialog(true)
    }
  }

  // Prevent dialog from closing if there are unsaved changes
  const handleDialogOpenChange = (open: boolean) => {
    if (!open && hasUnsavedChangesValue) {
      // Show confirmation instead of closing
      setDialogState({ ...dialogState, showUnsavedWarning: true })
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
    setDialogState({ ...dialogState, showUnsavedWarning: false })
  }

  // Extract only the fields the form expects
  const updateFormValues: Partial<UpdateWFPObjectiveTargetExpenditureValues> =
    formData && 'itemDescription' in formData
      ? {
          itemDescription: formData.itemDescription || '',
          unitEstimates: formData.unitEstimates || 0,
          quantity: formData.quantity || 1,
        }
      : {}

  return (
    <>
      <ResponsiveDialog
        open={dialogState.isOpen}
        onOpenChange={handleDialogOpenChange}
        title="Edit Item Expenditure"
        description="Update the details of the selected expenditure item."
      >
        {isLoading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
          </div>
        ) : (
          <UpdateWFPObjectiveTargetExpenditureForm
            onSubmit={handleUpdate}
            onCancel={handleClose}
            initialValues={updateFormValues}
          />
        )}
      </ResponsiveDialog>

      <ConfirmAlertDialog
        open={dialogState.showUnsavedWarning}
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
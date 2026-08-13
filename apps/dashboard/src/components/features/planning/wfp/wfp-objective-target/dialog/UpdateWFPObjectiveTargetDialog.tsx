import { useEffect } from 'react'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  closeUpdateDialogAtom,
  updateDialogAtom,
  updateFormDataAtom,
} from '../atoms'
import { updateWFPObjectiveTargetRequest } from '../handlers/updateWFPObjectiveTargetRequest'
import { getWFPObjectiveTargetRequest } from '../handlers/getWFPObjectiveTargetRequest'
import UpdateWFPObjectiveTargetForm from '../form/UpdateWFPObjectiveTargetForm'
import type { UpdateWFPObjectiveTargetValues } from '../form/UpdateWFPObjectiveTargetForm'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { extractErrorMessage } from '@/services/utils/messages'

export const hasUnsavedUpdateFormAtom = atom(false)

const useUpdateWFPObjectiveTarget = createMutationHookFromTemplate(updateWFPObjectiveTargetRequest)
const useWFPObjectiveTarget = createQueryHookFromTemplate(getWFPObjectiveTargetRequest)

export default function UpdateWFPObjectiveTargetDialog() {
  const { mutateAsync, isPending } = useUpdateWFPObjectiveTarget()
  const [dialogState, setDialogState] = useAtom(updateDialogAtom)
  const [formData, setFormData] = useAtom(updateFormDataAtom)
  const setHasUnsavedChanges = useSetAtom(hasUnsavedUpdateFormAtom)
  const hasUnsavedChangesValue = useAtomValue(hasUnsavedUpdateFormAtom)
  const closeDialog = useSetAtom(closeUpdateDialogAtom)
  const queryClient = useQueryClient()

  const selectedId = dialogState.selectedId || ''
  
  const { data: wfpObjectiveTargetResponse, isLoading } = useWFPObjectiveTarget({
    pathParams: { id: selectedId },
    queryParams: {},
  })

  const wfpObjectiveTargetData = wfpObjectiveTargetResponse?.data

  useEffect(() => {
    if (wfpObjectiveTargetData) {
      setFormData({
        wfpObjectiveId: wfpObjectiveTargetData.wfpObjective?.id,
        activityName: wfpObjectiveTargetData.activityName,
        indicator: wfpObjectiveTargetData.indicator,
        weight: wfpObjectiveTargetData.weight,
      })
    }
  }, [wfpObjectiveTargetData, setFormData])

  const handleUpdate = async (data: UpdateWFPObjectiveTargetValues) => {
    const { wfpObjectiveId, ...payload } = data
    const toastId = toast.loading('Updating Activity...')
    try {
      await mutateAsync({
        pathParams: { id: selectedId },
        payload,
      })
      void queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.some(key => 
          typeof key === 'string' && (
            key.includes('/wfp-objective-activities') || 
            key.includes('/wfp-objectives') ||
            key.includes('/wfps')
          )
        ),
      })
      toast.success('Activity updated successfully!', { id: toastId })
      closeDialog(true)
      setHasUnsavedChanges(false)
    } catch {
      toast.dismiss(toastId)
    }
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
    setHasUnsavedChanges(false)
    closeDialog(true)
  }

  const handleCancelUnsavedWarning = () => {
    setDialogState({ ...dialogState, showUnsavedWarning: false })
  }

  return (
    <>
      <ResponsiveDialog
        open={dialogState.isOpen}
        onOpenChange={handleDialogOpenChange}
        title="Update Activity"
        description="Modify the details of the Activity."
      >
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <UpdateWFPObjectiveTargetForm
            onSubmit={handleUpdate}
            onCancel={handleClose}
            isLoading={isPending}
            initialValues={{
              wfpObjectiveId: wfpObjectiveTargetData?.wfpObjective?.id || '',
              indicator: formData.indicator,
              activityName: formData.activityName,
              weight: formData.weight,
              ...formData,
            }}
            wfpObjectiveId={wfpObjectiveTargetData?.wfpObjective?.id || ''}
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
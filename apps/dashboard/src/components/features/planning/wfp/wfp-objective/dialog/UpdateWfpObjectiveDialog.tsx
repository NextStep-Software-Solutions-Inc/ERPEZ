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
import { updateWFPObjectiveRequest } from '../handlers/updateWFPObjectiveRequest'
import { getWFPObjectiveRequest } from '../handlers/getWFPObjectiveRequest'
import UpdateWFPObjectiveForm from '../form/UpdateWFPObjectiveForm'
import type { UpdateWFPObjectiveValues } from '../form/UpdateWFPObjectiveForm';
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

import { extractErrorMessage } from '@/services/utils/messages'

export const hasUnsavedUpdateFormAtom = atom(false)

const useUpdateWFPObjective = createMutationHookFromTemplate(updateWFPObjectiveRequest)
const useWFPObjective = createQueryHookFromTemplate(getWFPObjectiveRequest)

export default function UpdateWFPObjectiveDialog() {
  const { mutateAsync } = useUpdateWFPObjective()
  const [dialogState, setDialogState] = useAtom(updateDialogAtom)
  const [formData, setFormData] = useAtom(updateFormDataAtom)
  const setHasUnsavedChanges = useSetAtom(hasUnsavedUpdateFormAtom)
  const hasUnsavedChangesValue = useAtomValue(hasUnsavedUpdateFormAtom)
  const closeDialog = useSetAtom(closeUpdateDialogAtom)
  const queryClient = useQueryClient()

  const selectedId = dialogState.selectedId || ''
  
  const { data: wfpObjectiveResponse, isLoading } = useWFPObjective({
    pathParams: { id: selectedId },
    queryParams: {},
  })

  const wfpObjectiveData = wfpObjectiveResponse?.data

  useEffect(() => {
    if (wfpObjectiveData) {
      setFormData({
        description: wfpObjectiveData.description,
        weight: wfpObjectiveData.weight,
        outcome: wfpObjectiveData.outcome,
        wfpId: wfpObjectiveData.wfpId,
      })
    }
  }, [wfpObjectiveData, setFormData])

  const handleUpdate = async (data: UpdateWFPObjectiveValues) => {
    const toastId = toast.loading('Updating WFP Objective...')
    try {
      await mutateAsync({
        pathParams: { id: selectedId },
        payload: data,
      })
      void queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.some(key => 
          typeof key === 'string' && (
            key.includes('/wfp-objectives') ||
            key.includes('/wfps')
          )
        ),
      })
      toast.success('WFP Objective updated successfully!', { id: toastId })
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
        title="Update WFP Objective"
        description="Modify the details of the WFP Objective."
      >
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <UpdateWFPObjectiveForm
            onSubmit={handleUpdate}
            onCancel={handleClose}
            initialValues={{
              description: wfpObjectiveData?.description || '',
              weight: wfpObjectiveData?.weight || 0,
              outcome: wfpObjectiveData?.outcome || '',
              wfpId: wfpObjectiveData?.wfpId || '',
              ...formData,
            }}
            wfpId={wfpObjectiveData?.wfpId || ''}
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
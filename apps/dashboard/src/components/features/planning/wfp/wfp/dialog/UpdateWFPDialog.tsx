import { useEffect } from 'react'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { updateWFPRequest } from '../handlers/updateWFPRequest'
import {
  closeUpdateDialogAtom,
  updateDialogAtom,
  updateFormDataAtom,
} from '../atoms'
import { getWFPRequest } from '../handlers/getWFPRequest'
import UpdateWFPForm from '../form/UpdateWFPForm'
import type { UpdateWFPFormValues } from '../form/UpdateWFPForm';
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

export const hasUnsavedUpdateFormAtom = atom(false)

const useUpdateWFP = createMutationHookFromTemplate(updateWFPRequest)
const useWFP = createQueryHookFromTemplate(getWFPRequest)

export default function UpdateWFPDialog() {
  const { mutateAsync } = useUpdateWFP()
  const [dialogState, setDialogState] = useAtom(updateDialogAtom)
  const [formData, setFormData] = useAtom(updateFormDataAtom)
  const setHasUnsavedChanges = useSetAtom(hasUnsavedUpdateFormAtom)
  const hasUnsavedChangesValue = useAtomValue(hasUnsavedUpdateFormAtom)
  const closeDialog = useSetAtom(closeUpdateDialogAtom)
  const queryClient = useQueryClient()

  const selectedId = dialogState.selectedId || ''

  const { data: wfpResponse, isLoading } = useWFP({
    pathParams: { id: selectedId },
    queryParams: {}
  })

  const wfpData = wfpResponse?.data

  useEffect(() => {
    if (wfpData) {
      setFormData({
        officeId: wfpData.office?.id || wfpData.officeId || '',
        projectTitle: wfpData.projectTitle,
        projectStartDate: wfpData.projectStartDate,
        projectEndDate: wfpData.projectEndDate,
        generalObjective: wfpData.generalObjective,
        description: wfpData.description || '',
        fiscalYearId: wfpData.fiscalYearId || '',
        proposedBudget: wfpData.proposedBudget || 0,
        mode: (wfpData.mode?.toLowerCase() || null) as 'opcr' | 'external' | null,
        opcrId: wfpData.opcrId || '',
        fundSourceId: wfpData.fundSourceId || '',
      })
    }
  }, [wfpData, setFormData])

  const handleUpdate = async (data: UpdateWFPFormValues) => {
    toast.promise(
      mutateAsync(
        {
          pathParams: { id: selectedId },
          payload: data,
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) => query.queryKey.some(key => 
                typeof key === 'string' && key.includes('/wfps')
              ),
            })
            closeDialog(true)
            setHasUnsavedChanges(false)
          },
        },
      ),
      {
        loading: 'Updating WFP...',
        success: 'WFP updated successfully!',
        error: 'Failed to update WFP.',
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
        title="Update WFP"
        description="Modify the details of the Work and Financial Plan."
      >
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <UpdateWFPForm
            onSubmit={handleUpdate}
            onCancel={handleClose}
            initialValues={formData}
            onValueChange={(field, value) => {
              setFormData({ ...formData, [field]: value })
              setHasUnsavedChanges(true)
            }}
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
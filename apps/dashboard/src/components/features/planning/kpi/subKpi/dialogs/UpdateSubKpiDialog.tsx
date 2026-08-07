/**
 * UpdateSubKpiDialog Component
 * Dialog for updating an existing SubKPI
 * Composes ResponsiveDialog + UpdateSubKpiForm
 * Max 100 lines per guidelines
 */
import { useState } from 'react'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { useAtom, useSetAtom } from 'jotai'
import { updateSubKpiRequest } from '../handlers/updateSubKpiRequest'
import UpdateSubKpiForm from '../forms/UpdateSubKpiForm'
import {
  clearUpdateFormAtom,
  closeUpdateDialogAtom,
  updateDialogAtom,
} from '../atoms'
import type {UpdateSubKpiFormValues} from '../forms/UpdateSubKpiForm';
import type { KPI } from '../../types'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

interface UpdateSubKpiDialogProps {
  subKpi: KPI
}

const useUpdateSubKpi = createMutationHookFromTemplate(updateSubKpiRequest)

/**
 * UpdateSubKpiDialog Component
 * Handles SubKPI update with form and mutation
 */
export default function UpdateSubKpiDialog({
  subKpi,
}: UpdateSubKpiDialogProps) {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useUpdateSubKpi()
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [dialogState, setDialogState] = useAtom(updateDialogAtom)
  const closeDialog = useSetAtom(closeUpdateDialogAtom)
  const clearForm = useSetAtom(clearUpdateFormAtom)

  /** Handle form submission - payload now matches CreateKpiFormType */
  const handleSubmit = async (data: UpdateSubKpiFormValues) => {
    toast.promise(
      mutateAsync(
        {
          pathParams: { id: subKpi.id },
          payload: data,
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                query.queryKey[0].startsWith('/kpis'),
            })
            clearForm()
            closeDialog()
          },
        },
      ),
      {
        loading: 'Updating SubKPI...',
        success: 'SubKPI updated successfully!',
        error: 'Failed to update SubKPI.',
      },
    )
  }

  /** Handle dialog close with dirty form check */
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      closeDialog()
    } else {
      setDialogState({ isOpen: true, showUnsavedWarning: false, selectedId: subKpi.id })
    }
  }

  /** Confirm close and discard changes */
  const handleConfirmClose = () => {
    setShowUnsavedWarning(false)
    clearForm()
    closeDialog()
  }

  return (
    <>
      <ResponsiveDialog
        open={dialogState.isOpen}
        onOpenChange={handleOpenChange}
        title="Edit SubKPI"
        className="sm:max-w-[500px]"
      >
        <UpdateSubKpiForm
          subKpi={subKpi}
          onSubmit={handleSubmit}
          onCancel={() => {
            // Check if form is dirty and show warning if needed
            // For now, just close directly
            handleOpenChange(false)
          }}
          isLoading={isPending}
        />
      </ResponsiveDialog>
      <ConfirmAlertDialog
        open={showUnsavedWarning}
        onOpenChange={setShowUnsavedWarning}
        title="Unsaved Changes"
        description="You have unsaved changes that will be lost. Are you sure you want to close?"
        onConfirm={handleConfirmClose}
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
      />
    </>
  )
}

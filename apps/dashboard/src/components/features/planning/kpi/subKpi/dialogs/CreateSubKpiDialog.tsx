/**
 * CreateSubKpiDialog Component
 * Dialog for creating or updating a SubKPI (dual-use)
 * Composes ResponsiveDialog + CreateKpiForm
 * Max 100 lines per guidelines
 */
import { useState } from 'react'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { useAtom, useSetAtom } from 'jotai'
import CreateKpiForm from '../../form/CreateKpiForm'
import { createSubKpiRequest } from '../handlers/createSubKpiRequest'
import {
  clearCreateFormAtom,
  closeCreateDialogAtom,
  createDialogAtom,
} from '../atoms'
import type { CreateSubKpiFormType } from '../../form/CreateKpiForm'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import type { CreateSubKPIPayload } from '../handlers/createSubKpiRequest'

interface CreateSubKpiDialogProps {
  kpiId: string
}

const useCreateSubKpi = createMutationHookFromTemplate(createSubKpiRequest)

const buildCreateSubKpiPayload = (
  data: CreateSubKpiFormType,
): CreateSubKPIPayload => ({
  name: data.name,
  description: data.description,
  SDGs: data.SDGIds,
  kpiRatings: data.KPIRatings,
  kpiTargets: data.KPITargets.map((target) => ({
    period: target.period,
    value: target.targetValue,
    quarterName: target.quarterName,
  })),
  kpiMovs: data.KPIMOVs.map((mov) => ({
    name: mov.name,
    description: mov.description,
    file: mov.fileId || '',
  })),
})

/**
 * CreateSubKpiDialog Component
 * Handles SubKPI creation with form and mutation
 */
export default function CreateSubKpiDialog({ kpiId }: CreateSubKpiDialogProps) {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useCreateSubKpi()
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const clearForm = useSetAtom(clearCreateFormAtom)
  const [dialogState, setDialogState] = useAtom(createDialogAtom)
  const closeDialog = useSetAtom(closeCreateDialogAtom)

  /** Handle form submission for create */
  const handleSubmit = async (data: CreateSubKpiFormType) => {
    const onSuccessCallback = () => {
      void queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].startsWith('/kpis'),
      })

      clearForm()
      closeDialog()
    }

    toast.promise(
      mutateAsync(
        {
          pathParams: { kpiId },
          payload: buildCreateSubKpiPayload(data),
        },
        { onSuccess: onSuccessCallback },
      ),
      {
        loading: 'Creating SubKPI...',
        success: 'SubKPI created successfully!',
        error: 'Failed to create SubKPI.',
      },
    )
  }

  /** Handle dialog close with dirty form check */
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      closeDialog()
    } else {
      setDialogState({ isOpen: true, showUnsavedWarning: false })
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
        title="Create New SubKPI"
        className="min-h-[90vh] sm:max-w-[700px]"
      >
        <CreateKpiForm
          onSubmit={handleSubmit}
          onCancel={(form) =>
            form.state.isDirty
              ? setShowUnsavedWarning(true)
              : handleOpenChange(false)
          }
          mode="subKpi"
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

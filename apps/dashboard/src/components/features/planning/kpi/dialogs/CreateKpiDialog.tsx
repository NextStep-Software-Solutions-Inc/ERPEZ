import { useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { createKpiRequest } from '../handlers/createKpiRequest'
import CreateKpiForm from '../form/CreateKpiForm'
import { closeCreateDialogAtom, createDialogAtom } from '../atoms/dialogAtoms'
import type { CreateKpiFormValues } from '../form/CreateKpiForm'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { clearKpiFormStorageAtom } from '../form/kpiFormAtoms'

const useCreateKpi = createMutationHookFromTemplate(createKpiRequest)

export default function CreateKpiDialog() {
  const [dialogState, setDialogState] = useAtom(createDialogAtom)

  const closeDialog = useSetAtom(closeCreateDialogAtom)
  const { mutateAsync } = useCreateKpi()
  const [showUnsavedWarning, setShowUnsavedWarning] = useState<boolean>(false)
  const queryClient = useQueryClient()
  const clearStorage = useSetAtom(clearKpiFormStorageAtom)

  const handleCreateKpi = (data: CreateKpiFormValues): void => {
    toast.promise(
      mutateAsync(
        {
          pathParams: {},
          payload: data,
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                query.queryKey[0].startsWith('/kpis'),
            })
            clearStorage()
            closeDialog()
          },
        },
      ),
      {
        loading: 'Creating KPI...',
        success: 'KPI created successfully!',
        error: 'Failed to create KPI.',
      },
    )
  }

  const handleCancel = (): void => {
    setShowUnsavedWarning(true)
  }

  const handleConfirmDiscard = (): void => {
    clearStorage()
    setShowUnsavedWarning(false)
    closeDialog()
  }

  const handleOpenChange = (open: boolean): void => {
    if (!open && !showUnsavedWarning) {
      handleCancel()
    } else if (open) {
      setDialogState({ isOpen: true, showUnsavedWarning: false })
    }
  }

  return (
    <>
      <ResponsiveDialog
        open={dialogState.isOpen && !showUnsavedWarning}
        onOpenChange={handleOpenChange}
        title="Create new Key Performance Indicator (KPI)"
        className="min-h-[90vh] sm:max-w-[700px]"
      >
        <CreateKpiForm
          onSubmit={(data: CreateKpiFormValues) => handleCreateKpi(data)}
          onCancel={(form) => {
            if (form.state.isDirty) {
              setShowUnsavedWarning(true)
            } else {
              closeDialog()
            }
          }}
        />
      </ResponsiveDialog>

      <ConfirmAlertDialog
        open={showUnsavedWarning}
        onOpenChange={setShowUnsavedWarning}
        title="Unsaved Changes"
        description="You have unsaved changes that will be lost. Are you sure you want to continue?"
        onConfirm={handleConfirmDiscard}
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
      />
    </>
  )
}

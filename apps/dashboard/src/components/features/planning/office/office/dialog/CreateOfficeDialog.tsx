import { useState } from 'react'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { createOfficeRequest } from '../handlers/createOfficeRequest'
import OfficeForm from '../form/CreateOfficeForm'
import type { OfficeFormType } from '../form/CreateOfficeForm';
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

interface CreateOfficeDialogProps {
  onCreated?: (data: { name: string; description?: string }) => void
  open: boolean
  onCancel?: () => void
  onOpenChange?: (open: boolean) => void
}

const useCreateOffice = createMutationHookFromTemplate(createOfficeRequest)

export default function CreateOfficeDialog({
  onCreated,
  open,
  onCancel,
  onOpenChange,
}: CreateOfficeDialogProps) {
  const { mutateAsync } = useCreateOffice()
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const queryClient = useQueryClient()

  const handleCreateOffice = (data: OfficeFormType) => {
    const payload = {
      ...data,
      organizationId: data.organizationId || null,
      clusterId: data.clusterId || null,
      parentId: data.parentId || null,
      procurementWorkflowId: data.procurementWorkflowId || null,
      description: data.description || null,
      responsibilityCenterCode: data.responsibilityCenterCode || null,
      budgetCostCenter: data.budgetCostCenter || null,
    }
    toast.promise(
      mutateAsync(
        {
          pathParams: {},
          payload,
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) => query.queryKey[0] === '/offices',
            })
            onCreated?.({
              name: data.name,
              description: data.description ?? undefined,
            })
            onOpenChange?.(false)
          },
        },
      ),
      {
        loading: 'Creating Office...',
        success: 'Office created successfully!',
        error: 'Failed to create Office.',
      },
    )
  }

  return (
    <>
      <ResponsiveDialog
        open={open && !showUnsavedWarning}
        onOpenChange={onOpenChange}
        title="Create Office"
        className="sm:max-w-[700px]"
      >
        <OfficeForm
          mode="create"
          onSubmit={handleCreateOffice}
          onCancel={(form) =>
            form.state.isDirty
              ? setShowUnsavedWarning(true)
              : (onCancel?.() ?? onOpenChange?.(false))
          }
        />
      </ResponsiveDialog>

      <ConfirmAlertDialog
        open={showUnsavedWarning}
        onOpenChange={setShowUnsavedWarning}
        title="Unsaved Changes"
        description="You have unsaved changes that will be lost. Are you sure you want to continue?"
        onConfirm={() => {
          setShowUnsavedWarning(false)
          onCancel?.() ?? onOpenChange?.(false)
        }}
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
      />
    </>
  )
}

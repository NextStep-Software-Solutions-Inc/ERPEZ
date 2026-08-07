import { useState } from 'react'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { updateDeliveryUnitRequest } from '../handlers/updateDeliveryUnitRequest'
import CreateDeliveryUnitForm from '../form/CreateDeliveryUnitForm'
import type {
  CreateDeliveryUnitFormType,
} from '../form/CreateDeliveryUnitForm';
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

interface UpdateDeliveryUnitDialogProps {
  deliveryUnitId: string
  officeId: string
  onUpdated?: (data: {
    officeId: string
    parentId?: string | null
    deliveryUnitId?: string
  }) => void
  open: boolean
  onCancel?: () => void
  onOpenChange?: (open: boolean) => void
}

const useUpdateDeliveryUnit = createMutationHookFromTemplate(
  updateDeliveryUnitRequest,
)

export default function UpdateDeliveryUnitDialog({
  deliveryUnitId,
  officeId,
  onUpdated,
  open,
  onCancel,
  onOpenChange,
}: UpdateDeliveryUnitDialogProps) {
  const { mutateAsync } = useUpdateDeliveryUnit()
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const queryClient = useQueryClient()

  const handleUpdateDeliveryUnit = (data: CreateDeliveryUnitFormType) => {
    const payload = {
      officeId: data.officeId,
      parentId: data.parentId ?? undefined,
      id: deliveryUnitId,
    }

    toast.promise(
      mutateAsync(
        {
          pathParams: { id: deliveryUnitId },
          payload,
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) => query.queryKey[0] === '/delivery-units',
            })
            onUpdated?.({
              officeId: data.officeId,
              parentId: data.parentId ?? undefined,
              deliveryUnitId,
            })
            onOpenChange?.(false)
          },
        },
      ),
      {
        loading: 'Updating Delivery Unit...',
        success: 'Delivery Unit updated successfully!',
        error: 'Failed to update Delivery Unit.',
      },
    )
  }

  return (
    <>
      <ResponsiveDialog
        open={open && !showUnsavedWarning}
        onOpenChange={onOpenChange}
        title="Edit Delivery Unit"
        className="min-h-[90vh] sm:max-w-[700px]"
      >
        <CreateDeliveryUnitForm
          mode="update"
          initialValues={officeId ? { officeId } : {}}
          onSubmit={handleUpdateDeliveryUnit}
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

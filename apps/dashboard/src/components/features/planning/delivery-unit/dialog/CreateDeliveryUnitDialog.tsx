import { useState } from 'react'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { createDeliveryUnitRequest } from '../handlers/createDeliveryUnitRequest'
import CreateDeliveryUnitForm from '../form/CreateDeliveryUnitForm'
import type {
  CreateDeliveryUnitFormType,
} from '../form/CreateDeliveryUnitForm';
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

interface CreateDeliveryUnitDialogProps {
  open: boolean
  onCancel?: () => void
  onOpenChange?: (open: boolean) => void
  officeId?: string
  parentId?: string
}

const useCreateDeliveryUnit = createMutationHookFromTemplate(
  createDeliveryUnitRequest,
)

export default function CreateDeliveryUnitDialog({
  open,
  onCancel,
  onOpenChange,
  officeId,
  parentId,
}: CreateDeliveryUnitDialogProps) {
  const { mutateAsync } = useCreateDeliveryUnit()
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const queryClient = useQueryClient()

  const handleCreateDeliveryUnit = (data: CreateDeliveryUnitFormType) => {
    const noun = parentId ? 'Sub Delivery Unit' : 'Delivery Unit'
    const payload = {
      ...data,
      officeId: data.officeId,
      parentId: data.parentId || undefined,
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
              predicate: (query) => query.queryKey[0] === '/delivery-units',
            })
            onOpenChange?.(false)
          },
        },
      ),
      {
        loading: `Creating ${noun}...`,
        success: `${noun} created successfully!`,
        error: `Failed to create ${noun}.`,
      },
    )
  }
  return (
    <>
      <ResponsiveDialog
        open={open && !showUnsavedWarning}
        onOpenChange={onOpenChange}
        title={parentId ? 'Add Sub Delivery Unit' : 'Add Delivery Unit'}
        description={
          parentId
            ? 'Add a new Sub Delivery Unit with the required information.'
            : 'Add a new Delivery Unit with the required information.'
        }
        className="max-w-lg"
      >
        <CreateDeliveryUnitForm
          mode="create"
          onSubmit={handleCreateDeliveryUnit}
          onCancel={(form) =>
            form.state.isDirty
              ? setShowUnsavedWarning(true)
              : (onCancel?.() ?? onOpenChange?.(false))
          }
          officeId={officeId}
          parentId={parentId}
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

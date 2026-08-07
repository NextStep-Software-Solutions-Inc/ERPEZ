import { useState } from 'react'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { updateOfficeRequest } from '../handlers/updateOfficeRequest'
import OfficeForm from '../form/CreateOfficeForm'
import type { OfficeFormType } from '../form/CreateOfficeForm';
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

interface UpdateOfficeDialogProps {
  officeId: string
  office: OfficeFormType
  onUpdated?: (data: {
    name: string
    description?: string
    country?: string
    address?: string
    email?: string
    contactNumber?: string
    officeHead?: string
    responsibilityCenterCode?: string
  }) => void
  open: boolean
  onCancel?: () => void
  onOpenChange?: (open: boolean) => void
}

const useUpdateOffice = createMutationHookFromTemplate(updateOfficeRequest)

export default function UpdateOfficeDialog({
  officeId,
  office,
  onUpdated,
  open,
  onCancel,
  onOpenChange,
}: UpdateOfficeDialogProps) {
  const { mutateAsync } = useUpdateOffice()
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const queryClient = useQueryClient()

  const handleUpdateOffice = (data: OfficeFormType) => {
    // Transform data to match UpdateOfficePayload type
    const payload = {
      ...data,
      clusterId: data.clusterId || undefined,
      name: data.name,
      address: data.address || undefined,
      country: data.country || undefined,
      email: data.email || undefined,
      contactNumber: data.contactNumber || undefined,
      officeHead: data.officeHead || undefined,
      description: data.description || undefined,
      responsibilityCenterCode: data.responsibilityCenterCode || undefined,
    }

    toast.promise(
      mutateAsync(
        {
          pathParams: { id: officeId },
          payload,
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) => query.queryKey[0] === '/offices',
            })
            onUpdated?.({
              name: data.name,
              description: data.description ?? undefined,
              country: data.country ?? undefined,
            })
            onOpenChange?.(false)
          },
        },
      ),
      {
        loading: 'Updating Office...',
        success: 'Office updated successfully!',
        error: 'Failed to update Office.',
      },
    )
  }

  return (
    <>
      <ResponsiveDialog
        open={open && !showUnsavedWarning}
        onOpenChange={onOpenChange}
        title="Edit Office"
        className="sm:max-w-[700px]"
      >
        <OfficeForm
          mode="update"
          initialValues={office}
          onSubmit={handleUpdateOffice}
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

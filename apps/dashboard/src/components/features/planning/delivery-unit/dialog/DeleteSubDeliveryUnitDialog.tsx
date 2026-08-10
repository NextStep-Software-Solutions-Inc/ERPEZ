import { toast } from 'sonner'
import { createMutationHookFromTemplate, useQueryClient  } from 'erpez-shared-lib'
import { deleteSubDeliveryUnitRequest } from '../handlers/deleteSubDeliveryUnitRequest'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const useDeleteSubDeliveryUnit = createMutationHookFromTemplate(
  deleteSubDeliveryUnitRequest,
)

interface DeleteSubDeliveryUnitDialogProps {
  open: boolean
  onOpenChange?: (state: boolean) => void
  ids: Array<string>
  onSuccess?: () => void
  onCancel?: () => void
}

export default function DeleteSubDeliveryUnitDialog({
  ids,
  open,
  onOpenChange,
  onCancel,
  onSuccess,
}: DeleteSubDeliveryUnitDialogProps) {
  const { mutateAsync, isPending } = useDeleteSubDeliveryUnit()

  const queryClient = useQueryClient()
  const onDelete = () => {
    for (const id of ids) {
      toast.promise(
        mutateAsync(
          { pathParams: { id } },
          {
            onSuccess: () => {
              void queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === '/delivery-units',
              })
            },
          },
        ),
        {
          loading: 'Deleting sub delivery unit...',
          success: (res) => {
            onSuccess?.()
            onOpenChange?.(false)
            return res.message
          },
          error: 'Failed to delete sub delivery unit.',
        },
      )
    }
  }

  const handleCancelDelete = () => {
    void queryClient.cancelQueries({
      queryKey: ['sub-delivery-units/:id'],
    })
    onCancel?.()
  }

  return (
    <ConfirmAlertDialog
      loading={isPending}
      onConfirm={onDelete}
      onCancel={handleCancelDelete}
      open={open}
      onOpenChange={onOpenChange}
      title="Are you absolutely sure you want to delete this sub delivery unit?"
      description="This action cannot be undone. This will permanently delete the record from the server."
    />
  )
}

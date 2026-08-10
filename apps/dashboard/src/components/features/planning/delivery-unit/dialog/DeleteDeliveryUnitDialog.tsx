import { toast } from 'sonner'
import { createMutationHookFromTemplate, useQueryClient  } from 'erpez-shared-lib'
import { deleteDeliveryUnitRequest } from '../handlers/deleteDeliveryUnitRequest'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const useDeleteDeliveryUnit = createMutationHookFromTemplate(
  deleteDeliveryUnitRequest,
)

interface DeleteDeliveryUnitDialogProps {
  open: boolean
  onOpenChange?: (state: boolean) => void
  ids: Array<string>
  onSuccess?: () => void
  onCancel?: () => void
  tableType?: 'main' | 'sub-delivery-units'
}

export default function DeleteDeliveryUnitDialog({
  ids,
  open,
  onOpenChange,
  onCancel,
  onSuccess,
  tableType = 'main',
}: DeleteDeliveryUnitDialogProps) {
  const { mutateAsync, isPending } = useDeleteDeliveryUnit()

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
          loading: 'Deleting delivery unit...',
          success: (res) => {
            onSuccess?.()
            onOpenChange?.(false)
            return res.message
          },
          error: 'Failed to delete delivery unit.',
        },
      )
    }
  }

  const dialogTitle =
    tableType === 'sub-delivery-units'
      ? 'Are you absolutely sure you want to delete this sub-delivery unit?'
      : 'Are you absolutely sure you want to delete this delivery unit?'

  const dialogDescription =
    tableType === 'sub-delivery-units'
      ? 'This action cannot be undone. This will permanently delete the sub-delivery unit record from the server.'
      : 'This action cannot be undone. This will permanently delete the delivery unit record from the server.'

  const handleCancelDelete = () => {
    void queryClient.cancelQueries({
      queryKey: ['delivery-units/:id'],
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
      title={dialogTitle}
      description={dialogDescription}
    />
  )
}

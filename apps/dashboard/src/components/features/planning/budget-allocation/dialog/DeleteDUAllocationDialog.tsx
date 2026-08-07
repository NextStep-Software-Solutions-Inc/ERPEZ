import { toast } from 'sonner'
import { createMutationHookFromTemplate, useQueryClient  } from 'erpez-shared-lib'
import { deleteDUAllocationRequest } from '../handlers/deleteDUAllocationRequest'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const useDeleteDUAllocation = createMutationHookFromTemplate(
  deleteDUAllocationRequest,
)
interface DeleteDUAllocationDialogProps {
  open: boolean
  onOpenChange?: (state: boolean) => void
  ids: Array<string>
  onSuccess?: () => void
  onCancel?: () => void
}

export default function DeleteDUAllocationDialog({
  ids,
  open,
  onOpenChange,
  onCancel,
  onSuccess,
}: DeleteDUAllocationDialogProps) {
  const { mutateAsync, isPending } = useDeleteDUAllocation()

  const queryClient = useQueryClient()
  const onDelete = () => {
    for (const id of ids) {
      toast.promise(
        mutateAsync(
          { pathParams: { id } },
          {
            onSuccess: () => {
              void queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === '/du-allocations',
              })
            },
          },
        ),
        {
          loading: 'Deleting Budget allocation...',
          success: (res) => {
            onSuccess?.()
            onOpenChange?.(false)
            return res.message
          },
          error: 'Failed to delete Budget allocation.',
        },
      )
    }
  }

  const handleCancelDelete = () => {
    void queryClient.cancelQueries({
      queryKey: ['du-allocations/:id'],
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
      title="Are you absolutely sure you want to delete this Budget allocation?"
      description="This action cannot be undone. This will permanently delete the record from the server."
    />
  )
}

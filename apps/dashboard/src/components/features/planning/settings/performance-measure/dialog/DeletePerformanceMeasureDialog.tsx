import { toast } from 'sonner'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import * as erpSharedLib from 'erpez-shared-lib'
import { deletePerformanceMeasureRequest } from '../handlers/deletePerformanceMeasureRequest'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const { useQueryClient } = erpSharedLib
const useDeletePerformanceMeasure = createMutationHookFromTemplate(
  deletePerformanceMeasureRequest,
)

interface DeletePerformanceMeasureDialogProps {
  open: boolean
  onOpenChange: (state: boolean) => void
  ids: Array<string>
  onSuccess?: () => void
  onCancel?: () => void
}

export default function DeletePerformanceMeasureDialog({
  ids,
  open,
  onOpenChange,
  onCancel,
  onSuccess,
}: DeletePerformanceMeasureDialogProps) {
  const { mutateAsync, isPending } = useDeletePerformanceMeasure()

  const queryClient = useQueryClient()
  const onDelete = () => {
    for (const id of ids) {
      toast.promise(
        mutateAsync(
          { pathParams: { id } },
          {
            onSuccess: () => {
              void queryClient.invalidateQueries({
                predicate: (query) =>
                  query.queryKey[0] === 'get-performance-measure',
              })
            },
          },
        ),
        {
          loading: 'Deleting performance measure...',
          success: (res) => {
            onSuccess?.()
            onOpenChange(false)
            return res.message
          },
          error: 'Failed to delete performance measure.',
        },
      )
    }
  }

  const handleCancelDelete = () => {
    void queryClient.cancelQueries({
      queryKey: ['delete-performance-measure'],
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
      title="Are you absolutely sure you want to delete this performance measure?"
      description="This action cannot be undone. This will permanently delete the record from the server."
    />
  )
}

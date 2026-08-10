import { toast } from 'sonner'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import * as erpSharedLib from 'erpez-shared-lib'
import { deleteFunctionRequest } from '../handlers/deleteFunctionAllocationRequest'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const { useQueryClient } = erpSharedLib
const useDeleteFunctionAllocation = createMutationHookFromTemplate(
  deleteFunctionRequest,
)
interface DeleteFunctionAllocationDialogProps {
  open: boolean
  onOpenChange?: (state: boolean) => void
  ids: Array<string>
  onSuccess?: () => void
  onCancel?: () => void
}

export default function DeleteFunctionAllocationDialog({
  ids,
  open,
  onOpenChange,
  onCancel,
  onSuccess,
}: DeleteFunctionAllocationDialogProps) {
  const { mutateAsync, isPending } = useDeleteFunctionAllocation()

  const queryClient = useQueryClient()
  const onDelete = () => {
    for (const id of ids) {
      toast.promise(
        mutateAsync(
          { pathParams: { id } },
          {
            onSuccess: () => {
              void queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === '/fiscal-years',
              })
            },
          },
        ),
        {
          loading: 'Deleting function allocation...',
          success: (res) => {
            onSuccess?.()
            onOpenChange?.(false)
            return res.message
          },
          error: 'Failed to delete fiscal year.',
        },
      )
    }
  }

  const handleCancelDelete = () => {
    void queryClient.cancelQueries({
      queryKey: ['fiscal-years/:id'],
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
      title="Are you absolutely sure you want to delete this Function Allocation?"
      description="This action cannot be undone. This will permanently delete the record from the server."
    />
  )
}

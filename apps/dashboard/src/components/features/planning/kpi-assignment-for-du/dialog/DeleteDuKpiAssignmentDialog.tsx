import { toast } from 'sonner'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import * as erpSharedLib from 'erpez-shared-lib'
import { deleteKpiAssignmentRequest } from '../handlers/deleteKpiAssignmentRequest'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const { useQueryClient } = erpSharedLib
const useDeleteDuKpiAssignment = createMutationHookFromTemplate(
  deleteKpiAssignmentRequest,
)
interface DeleteDuKpiAssignmentDialogProps {
  open: boolean
  onOpenChange?: (state: boolean) => void
  ids: Array<string>
  onSuccess?: () => void
  onCancel?: () => void
}

export default function DeleteDuKpiAssignmentDialog({
  ids,
  open,
  onOpenChange,
  onCancel,
  onSuccess,
}: DeleteDuKpiAssignmentDialogProps) {
  const { mutateAsync, isPending } = useDeleteDuKpiAssignment()

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
          loading: 'Deleting kpi assignment...',
          success: (res) => {
            onSuccess?.()
            onOpenChange?.(false)
            return res.message
          },
          error: 'Failed to delete KPI assignment.',
        },
      )
    }
  }

  const handleCancelDelete = () => {
    void queryClient.cancelQueries({
      queryKey: ['delete-du-kpi-assignment'],
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
      title="Are you absolutely sure you want to delete this KPI assignment?"
      description="This action cannot be undone. This will permanently delete the record from the server."
    />
  )
}

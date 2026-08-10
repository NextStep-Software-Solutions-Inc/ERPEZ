import { toast } from 'sonner'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import * as erpSharedLib from 'erpez-shared-lib'
import { deleteOfficeRequest } from '../handlers/deleteOfficeRequest'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const { useQueryClient } = erpSharedLib
const useDeleteOffice = createMutationHookFromTemplate(deleteOfficeRequest)

interface DeleteOfficeDialogProps {
  open: boolean
  onOpenChange?: (state: boolean) => void
  ids: Array<string>
  onSuccess?: () => void
  onCancel?: () => void
}

export default function DeleteOfficeDialog({
  ids,
  open,
  onOpenChange,
  onCancel,
  onSuccess,
}: DeleteOfficeDialogProps) {
  const { mutateAsync, isPending } = useDeleteOffice()

  const queryClient = useQueryClient()

  const onDelete = () => {
    for (const id of ids) {
      toast.promise(
        mutateAsync(
          { pathParams: { id } },
          {
            onSuccess: () => {
              void queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === '/offices',
              })
            },
          },
        ),
        {
          loading: 'Deleting office...',
          success: (res) => {
            onSuccess?.()
            onOpenChange?.(false)
            return res.message
          },
          error: 'Failed to delete office.',
        },
      )
    }
  }

  const handleCancelDelete = () => {
    void queryClient.cancelQueries({
      queryKey: ['offices/:id'],
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
      title="Are you sure you want to delete this office?"
      description="This action cannot be undone. This will permanently delete the office from the server."
    />
  )
}

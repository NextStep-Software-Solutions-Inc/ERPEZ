import { toast } from 'sonner'
import { createMutationHookFromTemplate, useQueryClient  } from 'erpez-shared-lib'
import { deleteClusterRequest } from '../handlers/deleteOrganizationalClusterRequest'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const useDeleteCluster = createMutationHookFromTemplate(deleteClusterRequest)

interface DeleteClusterDialogProps {
  open: boolean
  onOpenChange?: (state: boolean) => void
  ids: Array<string>
  onSuccess?: () => void
  onCancel?: () => void
}

export default function DeleteKpiDialog({
  ids,
  open,
  onOpenChange,
  onCancel,
  onSuccess,
}: DeleteClusterDialogProps) {
  const { mutateAsync, isPending } = useDeleteCluster()

  const queryClient = useQueryClient()
  const onDelete = () => {
    for (const id of ids) {
      toast.promise(
        mutateAsync(
          { pathParams: { id } },
          {
            onSuccess: () => {
              void queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === '/clusters',
              })
            },
          },
        ),
        {
          loading: 'Deleting cluster...',
          success: (res) => {
            onSuccess?.()
            onOpenChange?.(false)
            return res.message
          },
          error: 'Failed to delete cluster.',
        },
      )
    }
  }

  const handleCancelDelete = () => {
    void queryClient.cancelQueries({
      queryKey: ['clusters/:id'],
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
      title="Are you absolutely sure you want to delete this organizational cluster?"
      description="This action cannot be undone. This will permanently delete the record from the server."
    />
  )
}

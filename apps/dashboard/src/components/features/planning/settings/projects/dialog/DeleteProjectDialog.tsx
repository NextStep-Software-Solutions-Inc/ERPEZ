import { toast } from 'sonner'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import * as erpSharedLib from 'erpez-shared-lib'
import { deleteProjectRequest } from '../handlers/deleteProjectRequest'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const { useQueryClient } = erpSharedLib
const useDeleteProject = createMutationHookFromTemplate(deleteProjectRequest)

interface DeleteProjectDialogProps {
  open: boolean
  onOpenChange: (state: boolean) => void
  ids: Array<string>
  onSuccess?: () => void
  onCancel?: () => void
}

export default function DeleteProjectDialog({
  ids,
  open,
  onOpenChange,
  onCancel,
  onSuccess,
}: DeleteProjectDialogProps) {
  const { mutateAsync, isPending } = useDeleteProject()

  const queryClient = useQueryClient()
  const onDelete = () => {
    for (const id of ids) {
      toast.promise(
        mutateAsync(
          { pathParams: { id } },
          {
            onSuccess: () => {
              void queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === 'get-project',
              })
            },
          },
        ),
        {
          loading: 'Deleting project...',
          success: (res) => {
            onSuccess?.()
            onOpenChange(false)
            return res.message
          },
          error: 'Failed to delete project.',
        },
      )
    }
  }

  const handleCancelDelete = () => {
    void queryClient.cancelQueries({
      queryKey: ['delete-project'],
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
      title="Are you absolutely sure you want to delete this project?"
      description="This action cannot be undone. This will permanently delete the record from the server."
    />
  )
}

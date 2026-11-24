import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import type { ObjectCode } from '../types/objectCodeTypes'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { deleteObjectCodeRequest } from '../handlers/deleteObjectCodeRequest'
import { getObjectCodesRequest } from '../handlers/getObjectCodesRequest'

const useDeleteObjectCode = createMutationHookFromTemplate(deleteObjectCodeRequest)

interface DeleteObjectCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  objectCode?: ObjectCode
  onSuccess?: (id: string) => void
}

export function DeleteObjectCodeDialog({
  open,
  onOpenChange,
  objectCode,
  onSuccess,
}: DeleteObjectCodeDialogProps) {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useDeleteObjectCode()

  const handleConfirm = async () => {
    if (!objectCode?.id) return

    try {
      await mutateAsync({
        pathParams: { id: objectCode.id },
      })
      toast.success(`Object Code "${objectCode.name}" deleted successfully!`)

      void queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === getObjectCodesRequest.endpoint ||
          (typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith(getObjectCodesRequest.endpoint)),
      })

      onOpenChange(false)
      onSuccess?.(objectCode.id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete object code.'
      toast.error(errorMessage)
      console.error(err)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Object Code?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{objectCode?.name}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end gap-3">
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}


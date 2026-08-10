import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { deleteLocationCodeRequest } from '../handlers/deleteLocationCodeRequest'
import { getLocationCodesRequest } from '../handlers/getLocationCodesRequest'
import type { LocationCode } from '../types/locationCodeTypes'

// Create mutation hook outside component to avoid recreation on each render
const useDeleteLocationCode = createMutationHookFromTemplate(deleteLocationCodeRequest)

interface DeleteLocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locationCode?: LocationCode
  onSuccess?: (id: string) => void
}

export function DeleteLocationDialog({
  open,
  onOpenChange,
  locationCode,
  onSuccess,
}: DeleteLocationDialogProps) {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useDeleteLocationCode()

  const handleConfirm = async () => {
    if (!locationCode?.id) return

    try {
      await mutateAsync({
        pathParams: { id: locationCode.id },
      })

      toast.success(`Location Code "${locationCode.name}" deleted successfully!`)
      
      // Invalidate the location codes list query to trigger a refetch
      void queryClient.invalidateQueries({
        queryKey: [getLocationCodesRequest.endpoint]
      })
      
      onOpenChange(false)
      onSuccess?.(locationCode.id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete location code'
      console.error('Delete error:', err)
      toast.error(errorMessage)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Location Code?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{locationCode?.name}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end gap-3">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
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

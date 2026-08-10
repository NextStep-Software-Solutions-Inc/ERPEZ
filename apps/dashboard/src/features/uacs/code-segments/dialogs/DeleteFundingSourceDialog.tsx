import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { deleteFundingSourceRequest } from '../handlers/deleteFundingSourceRequest'
import { getFundingSourcesRequest } from '../handlers/getFundingSourcesRequest'
import type { FundingSource } from '../types/fundingSourceTypes'

// Create mutation hook outside component to avoid recreation on each render
const useDeleteFundingSource = createMutationHookFromTemplate(deleteFundingSourceRequest)

interface DeleteFundingSourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fundingSource?: FundingSource
  onSuccess?: (id: string) => void
}

export function DeleteFundingSourceDialog({
  open,
  onOpenChange,
  fundingSource,
  onSuccess,
}: DeleteFundingSourceDialogProps) {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useDeleteFundingSource()

  const handleConfirm = async () => {
    if (!fundingSource?.id) return

    try {
      console.log('Deleting funding source with ID:', fundingSource.id)

      await mutateAsync({
        pathParams: { id: fundingSource.id },
      })

      console.log('Delete successful')

      toast.success(`Funding Source "${fundingSource.name}" deleted successfully!`)
      
      // Invalidate the funding sources list query to trigger a refetch
      void queryClient.invalidateQueries({
        queryKey: [getFundingSourcesRequest.endpoint]
      })
      
      onOpenChange(false)
      onSuccess?.(fundingSource.id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete funding source'
      console.error('Delete error:', err)
      toast.error(errorMessage)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Funding Source?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{fundingSource?.name}"? This action cannot be undone.
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

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { deleteOrganizationCodeRequest } from '../handlers/deleteOrganizationCodeRequest'
import { getOrganizationCodesRequest } from '../handlers/getOrganizationCodesRequest'
import type { OrganizationCode } from '../types/organizationCodeTypes'

// Create mutation hook outside component to avoid recreation on each render
const useDeleteOrganizationCode = createMutationHookFromTemplate(deleteOrganizationCodeRequest)

interface DeleteOrganizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationCode?: OrganizationCode
  onSuccess?: (id: string) => void
}

export function DeleteOrganizationDialog({
  open,
  onOpenChange,
  organizationCode,
  onSuccess,
}: DeleteOrganizationDialogProps) {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useDeleteOrganizationCode()

  const handleConfirm = async () => {
    if (!organizationCode?.id) return

    try {
      await mutateAsync({
        pathParams: { id: organizationCode.id },
      })

      toast.success(`Organization Code "${organizationCode.name}" deleted successfully!`)
      
      // Invalidate the organization codes list query to trigger a refetch
      void queryClient.invalidateQueries({
        queryKey: [getOrganizationCodesRequest.endpoint]
      })
      
      onOpenChange(false)
      onSuccess?.(organizationCode.id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete organization code'
      console.error('Delete error:', err)
      toast.error(errorMessage)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Organization Code?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{organizationCode?.name}"? This action cannot be undone.
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

import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteItemMasterRequest } from '../handlers/deleteItemMasterRequest'

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId: string | null
  itemName: string
}

const useDeleteItemMaster = createMutationHookFromTemplate(
  deleteItemMasterRequest,
)

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  itemId,
  itemName,
}: DeleteConfirmationDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useDeleteItemMaster()

  const handleConfirm = async () => {
    if (!itemId) {
      toast({
        title: 'Error',
        description: 'Unable to delete item because the item id is missing.',
        color: 'destructive',
      })
      return
    }

    try {
      await mutateAsync(
        {
          pathParams: { id: itemId },
          queryParams: { id: itemId },
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) =>
                query.queryKey.some(
                  (key) =>
                    typeof key === 'string' &&
                    key.includes('/procurement-items'),
                ),
            })
          },
        },
      )

      onOpenChange(false)
      toast({
        title: 'Success',
        description: `Item "${itemName}" has been deleted successfully.`,
        color: 'success',
      })
    } catch (error) {
      console.error('Error deleting item:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete item. Please try again.',
        color: 'destructive',
      })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Item Master</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">{itemName}</span>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isPending}
            className="bg-white text-foreground hover:bg-gray-100 border border-gray-300"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

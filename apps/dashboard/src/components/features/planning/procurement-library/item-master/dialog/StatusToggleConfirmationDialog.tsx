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
import type { ItemMaster } from '../../types'
import { updateItemMasterRequest } from '../handlers/updateItemMasterRequest'

interface StatusToggleConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ItemMaster | null
}

const useUpdateItemMaster = createMutationHookFromTemplate(
  updateItemMasterRequest,
)

export function StatusToggleConfirmationDialog({
  open,
  onOpenChange,
  item,
}: StatusToggleConfirmationDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useUpdateItemMaster()

  const currentStatus = item?.status ?? 'active'
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  const action = newStatus === 'active' ? 'Activate' : 'Deactivate'

  const handleConfirm = async () => {
    if (!item) {
      toast({
        title: 'Error',
        description:
          'Unable to update item status because the item data is missing.',
        color: 'destructive',
      })
      return
    }

    if (!item.objectCodeId || !item.uomId) {
      toast({
        title: 'Error',
        description: 'Status updates require API-synced item identifiers.',
        color: 'destructive',
      })
      return
    }

    try {
      const response = await mutateAsync(
        {
          pathParams: { id: item.id },
          payload: {
            name: item.itemName,
            specifications: item.minimumTechnicalSpecifications,
            type: item.itemType,
            isCSE: item.isCSE,
            itemLife: Number(item.itemLife) || 0,
            productCode: item.productCode,
            imageURL: item.imageURL,
            isActive: newStatus === 'active',
            objectCodeId: item.objectCodeId,
            unspscCodeId: item.unspscCodeId,
            uomId: item.uomId,
          },
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
        description:
          response.message ||
          `Item "${item.itemName}" has been ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`,
        color: newStatus === 'active' ? 'success' : 'warning',
      })
    } catch (error) {
      console.error('Error toggling status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update item status. Please try again.',
        color: 'destructive',
      })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{action} Item Master</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {action.toLowerCase()}{' '}
            <span className="font-semibold text-foreground">
              {item?.itemName}
            </span>
            ?
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
            className={
              newStatus === 'active'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }
          >
            {isPending ? `${action}ing...` : action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

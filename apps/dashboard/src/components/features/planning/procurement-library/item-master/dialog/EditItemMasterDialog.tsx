import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ItemMasterWizardForm } from './ItemMasterWizardForm'
import { useToast } from '@/components/ui/use-toast'
import type { ItemMaster, ItemMasterFormData } from '../../types'
import { updateItemMasterRequest } from '../handlers/updateItemMasterRequest'

interface EditItemMasterDialogProps {
  item: ItemMaster
  open: boolean
  onOpenChange: (open: boolean) => void
}
const useUpdateItemMasterMutation = createMutationHookFromTemplate(
  updateItemMasterRequest,
)
export function EditItemMasterDialog({
  item,
  open,
  onOpenChange,
}: EditItemMasterDialogProps) {
  const { toast } = useToast()

  const { mutateAsync, isPending } = useUpdateItemMasterMutation()
  const queryClient = useQueryClient()

  const handleSubmit = async (data: ItemMasterFormData) => {
    try {
      // const hasItemLifeValue =
      //   data.itemLife !== '' &&
      //   data.itemLife !== null &&
      //   data.itemLife !== undefined
      const hasUnspscCodeIdValue =
        typeof data.unspscCodeId === 'string'
          ? data.unspscCodeId.trim() !== ''
          : data.unspscCodeId !== null && data.unspscCodeId !== undefined

      const payload = {
        name: data.itemName,
        specifications: data.minimumTechnicalSpecifications,
        type: data.itemType,
        isCSE: data.isCSE,
        // ...(hasItemLifeValue ? { itemLife: Number(data.itemLife) } : {}),
        itemLife: Number(data.itemLife) || 0,
        productCode: data.productCode,
        imageURL: data.imageURL,
        isActive: item.isActive,
        objectCodeId: data.objectCodeId,
        ...(hasUnspscCodeIdValue ? { unspscCodeId: data.unspscCodeId } : {}),
        uomId: data.uomId,
      }

      const response = await mutateAsync(
        { pathParams: { id: item.id }, payload },
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

      toast({
        title: 'Updated',
        description: response?.message || 'Item master updated.',
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating item master:', error)
      toast({
        title: 'Error',
        description: 'Error updating item master. Please try again.',
        color: 'destructive',
      })
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Item Master"
      description="Update item master entry details"
      size="full"
      className="max-w-[800px] max-h-[90vh]"
      footer={null}
      showCloseButton
    >
      <ItemMasterWizardForm
        initialData={{
          itemName: item.itemName,
          uacsCode: item.uacsCode,
          objectCodeId: item.objectCodeId ?? '',
          objectCodeName: item.objectCodeName ?? '',
          isCSE: item.isCSE,
          unspscCode: item.unspscCode,
          unspscCodeId: item.unspscCodeId,
          minimumTechnicalSpecifications: item.minimumTechnicalSpecifications,
          uom: item.uom,
          uomId: item.uomId ?? '',
          uomName: item.uomName ?? '',
          itemType: item.itemType,
          itemLife: item.itemLife || '',
          itemLifeUnit: item.itemLifeUnit || 'years',
          productCode: item.productCode || '',
          imageURL: item.imageURL || '',
        }}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
        isLoading={isPending}
        isCreateMode={false}
      />
    </ResponsiveDialog>
  )
}

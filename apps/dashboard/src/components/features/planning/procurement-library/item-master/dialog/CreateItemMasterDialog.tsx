import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import PermissionCheck from '@/components/PermissionCheck'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { ItemMasterWizardForm } from './ItemMasterWizardForm'
import { useToast } from '@/components/ui/use-toast'
import type { ItemMasterFormData } from '../../types'
import type { MetaActions } from '@/types/global'
import { createItemMasterRequest } from '../handlers/createItemMasterRequest'
import type { CreateProcurementItemPayload } from '../types'

const useCreateItemMaster = createMutationHookFromTemplate(
  createItemMasterRequest,
)

interface CreateItemMasterDialogProps {
  actions: MetaActions
}

export function CreateItemMasterDialog({
  actions,
}: CreateItemMasterDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const { mutateAsync, isPending } = useCreateItemMaster()

  const handleSubmit = async (data: ItemMasterFormData) => {
    try {
      const payload: CreateProcurementItemPayload = {
        name: data.itemName,
        specifications: data.minimumTechnicalSpecifications,
        type: data.itemType,
        isCSE: data.isCSE,
        itemLife: Number(data.itemLife) || 0,
        productCode: data.productCode,
        imageURL: data.imageURL,
        objectCodeId: data.objectCodeId,
        uomId: data.uomId,
        ...(data.unspscCodeId ? { unspscCodeId: data.unspscCodeId } : {}),
      }

      const response = await mutateAsync(
        {
          pathParams: {},
          payload,
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

      setOpen(false)
      toast({
        title: 'Success',
        description:
          response.message || 'Item master has been created successfully.',
        color: 'success',
      })
    } catch (error) {
      console.error('Error creating item master:', error)
      toast({
        title: 'Error',
        description: 'Error creating item master. Please try again.',
        color: 'destructive',
      })
    }
  }

  return (
    <PermissionCheck action="write" actions={actions}>
      <ResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        title="Add Item Master"
        description="Create a new item master entry"
        size="full"
        className="max-w-[800px] max-h-[90vh]"
        trigger={
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        }
        footer={null}
        showCloseButton
      >
        <ItemMasterWizardForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isLoading={isPending}
          isCreateMode={true}
        />
      </ResponsiveDialog>
    </PermissionCheck>
  )
}

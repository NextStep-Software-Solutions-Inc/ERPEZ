import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import SubmitButton from '@/components/SubmitButton'
import { Button } from '@/components/ui/button'
import {
  AddPPMPItemForm,
  type PPMPItemFormValues,
} from '../forms/AddPPMPItemForm'
import { createPPMPItemRequest } from '../handlers/createPPMPItemRequest'
import { updatePPMPItemRequest } from '../handlers/updatePPMPItemRequest'
import type { PPMPItem } from '../types'

const useCreatePPMPItem = createMutationHookFromTemplate(createPPMPItemRequest)
const useUpdatePPMPItem = createMutationHookFromTemplate(updatePPMPItemRequest)

interface AddPPMPItemDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  ppmpExpenditureItemId: string
  itemToEdit?: PPMPItem | null
  onSuccess?: () => void
}

export default function AddPPMPItemDialog({
  isOpen,
  onOpenChange,
  ppmpExpenditureItemId,
  itemToEdit,
  onSuccess,
}: AddPPMPItemDialogProps) {
  const queryClient = useQueryClient()
  const { mutateAsync: createItem, isPending: isCreating } = useCreatePPMPItem()
  const { mutateAsync: updateItem, isPending: isUpdating } = useUpdatePPMPItem()

  const isEdit = !!itemToEdit
  const isLoading = isCreating || isUpdating

  const handleSubmit = async (values: PPMPItemFormValues) => {
    const payload = {
      ...values,
      ppmpExpenditureItemId,
      // Format dates back to ISO strings or null if empty
      procurementStartDate: values.procurementStartDate || null,
      procurementEndDate: values.procurementEndDate || null,
      expectedDeliveryStart: values.expectedDeliveryStart || null,
      expectedDeliveryEnd: values.expectedDeliveryEnd || null,
    }

    try {
      if (isEdit && itemToEdit) {
        await toast.promise(
          updateItem(
            {
              pathParams: { id: itemToEdit.id },
              queryParams: {},
              payload,
            },
            {
              onSuccess: () => {
                void queryClient.invalidateQueries({
                  predicate: (query) =>
                    typeof query.queryKey[0] === 'string' &&
                    (query.queryKey[0].startsWith('/ppmp-items') ||
                      query.queryKey[0].startsWith('/ppmp-expenditure-items') ||
                      query.queryKey[0].startsWith('/ppmp')),
                })
                onSuccess?.()
                onOpenChange(false)
              },
            },
          ),
          {
            loading: 'Updating item...',
            success: 'Item updated successfully',
            error: (err) =>
              err instanceof Error ? err.message : 'Failed to update item',
          },
        )
      } else {
        await toast.promise(
          createItem(
            {
              pathParams: {},
              payload: {
                ...payload,
                mopOverride: false,
              },
            },
            {
              onSuccess: async () => {
                await queryClient.invalidateQueries({
                  predicate: (query) =>
                    typeof query.queryKey[0] === 'string' &&
                    (query.queryKey[0].startsWith('/ppmp-items') ||
                      query.queryKey[0].startsWith('/ppmp-expenditure-items') ||
                      query.queryKey[0].startsWith('/ppmp')),
                })
                // Safety delay to confirm item in list before closing dialog
                await new Promise((resolve) => setTimeout(resolve, 600))
                onSuccess?.()
                onOpenChange(false)
              },
            },
          ),
          {
            loading: 'Adding item...',
            success: 'Item added successfully',
            error: (err) =>
              err instanceof Error ? err.message : 'Failed to add item',
          },
        )
      }
    } catch {
      // toast.promise handles presentation
    }
  }

  const initialValues: Partial<PPMPItemFormValues> = {
    name: itemToEdit?.name ?? '',
    description: itemToEdit?.description ?? '',
    unit: itemToEdit?.unit ?? 'pcs',
    unitPrice: itemToEdit?.unitPrice ?? 0,
    plannedQuantity: itemToEdit?.plannedQuantity ?? 1,
    procurementModeId: itemToEdit?.procurementModeId ?? '',
    papCode: itemToEdit?.papCode ?? '',
    projectType: itemToEdit?.projectType ?? 'Goods',
    preProcurementConference: itemToEdit?.preProcurementConference ?? false,
    procurementStartDate: itemToEdit?.procurementStartDate ? itemToEdit.procurementStartDate.split('T')[0] : '',
    procurementEndDate: itemToEdit?.procurementEndDate ? itemToEdit.procurementEndDate.split('T')[0] : '',
    expectedDeliveryStart: itemToEdit?.expectedDeliveryStart ? itemToEdit.expectedDeliveryStart.split('T')[0] : '',
    expectedDeliveryEnd: itemToEdit?.expectedDeliveryEnd ? itemToEdit.expectedDeliveryEnd.split('T')[0] : '',
    remarks: itemToEdit?.remarks ?? '',
  }

  return (
    <ResponsiveDialogDashtail
      open={isOpen}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit PPMP Item' : 'Add PPMP Item'}
      description={isEdit ? 'Modify the details of this procurement item.' : 'Add a new procurement item to this group.'}
      size="lg"
      trigger={null}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="h-9 px-4 text-xs font-semibold"
          >
            Cancel
          </Button>
          <SubmitButton
            form="add-ppmp-item-form"
            loading={isLoading}
            className="bg-primary hover:bg-primary/95 text-white"
          >
            {isLoading ? (isEdit ? 'Saving...' : 'Adding...') : isEdit ? 'Save Changes' : 'Add PPMP Item'}
          </SubmitButton>
        </div>
      }
    >
      <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        <AddPPMPItemForm
          formId="add-ppmp-item-form"
          initialValues={initialValues}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </ResponsiveDialogDashtail>
  )
}

import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import SubmitButton from '@/components/SubmitButton'
import { Button } from '@/components/ui/button'
import {
  AddPPMPItemExpenditureForm,
  type PPMPExpenditureItemFormValues,
} from '../forms/AddPPMPItemExpenditureForm'
import { createPPMPExpenditureItemRequest } from '../handlers/createPPMPExpenditureItemRequest'
import { updatePPMPExpenditureItemRequest } from '../handlers/updatePPMPExpenditureItemRequest'
import type { PPMPExpenditureItem } from '../types'

const useCreatePPMPExpenditureItem = createMutationHookFromTemplate(
  createPPMPExpenditureItemRequest,
)
const useUpdatePPMPExpenditureItem = createMutationHookFromTemplate(
  updatePPMPExpenditureItemRequest,
)

interface AddPPMPItemExpenditureDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  ppmpId: string
  ppmpActivityId: string
  libActivityId?: string
  groupToEdit?: PPMPExpenditureItem | null
  existingObjectIds?: string[]
}

export default function AddPPMPItemExpenditureDialog({
  isOpen,
  onOpenChange,
  ppmpId,
  ppmpActivityId,
  libActivityId,
  groupToEdit,
  existingObjectIds,
}: AddPPMPItemExpenditureDialogProps) {
  const queryClient = useQueryClient()
  const { mutateAsync: createGroup, isPending: isCreating } =
    useCreatePPMPExpenditureItem()
  const { mutateAsync: updateGroup, isPending: isUpdating } =
    useUpdatePPMPExpenditureItem()

  const isEdit = !!groupToEdit
  const isLoading = isCreating || isUpdating

  const handleSubmit = async (values: PPMPExpenditureItemFormValues) => {
    const payload = {
      ...values,
      ppmpId,
      ppmpActivityId,
    }

    try {
      if (isEdit && groupToEdit) {
        await toast.promise(
          updateGroup(
            {
              pathParams: { id: groupToEdit.id },
              queryParams: {},
              payload,
            },
            {
              onSuccess: () => {
                void queryClient.invalidateQueries({
                  predicate: (query) =>
                    typeof query.queryKey[0] === 'string' &&
                    (query.queryKey[0].startsWith('/ppmp-expenditure-items') ||
                      query.queryKey[0].startsWith('/ppmp')),
                })

                onOpenChange(false)
              },
            },
          ),
          {
            loading: 'Updating expenditure item...',
            error: (err) =>
              err instanceof Error
                ? err.message
                : 'Failed to update expenditure item',
          },
        )
      } else {
        await toast.promise(
          createGroup(
            {
              pathParams: {},
              payload,
            },
            {
              onSuccess: () => {
                void queryClient.invalidateQueries({
                  predicate: (query) =>
                    typeof query.queryKey[0] === 'string' &&
                    (query.queryKey[0].startsWith('/ppmp-expenditure-items') ||
                      query.queryKey[0].startsWith('/ppmp')),
                })
                onOpenChange(false)
              },
            },
          ),
          {
            action: 'Adding expenditure item...',
            loading: true,
          },
        )
      }
    } catch {
      // Error notifications are handled by toast.promise
    }
  }

  const initialValues: Partial<PPMPExpenditureItemFormValues> = {
    isProcurable: groupToEdit?.isProcurable ?? true,
    objectId: groupToEdit?.objectId ?? '',
  }

  return (
    <ResponsiveDialogDashtail
      open={isOpen}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Expenditure Item' : 'Add Expenditure Item'}
      description={
        isEdit
          ? 'Modify details for this expenditure item.'
          : 'Add a new expenditure item to this activity.'
      }
      size="md"
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
            form="add-ppmp-expenditure-form"
            loading={isLoading}
            className="bg-primary hover:bg-primary/95 text-white"
          >
            {isLoading
              ? 'Saving...'
              : isEdit
                ? 'Save Changes'
                : 'Add Expenditure Item'}
          </SubmitButton>
        </div>
      }
    >
      <div className="p-4">
        <AddPPMPItemExpenditureForm
          formId="add-ppmp-expenditure-form"
          initialValues={initialValues}
          libActivityId={libActivityId}
          existingObjectIds={existingObjectIds}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </ResponsiveDialogDashtail>
  )
}

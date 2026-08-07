import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ModeOfProcurementForm } from './ModeOfProcurementForm'
import { useToast } from '@/components/ui/use-toast'
import { useQueryClient } from 'erpez-shared-lib'
import type { ModeOfProcurement, ModeOfProcurementFormData } from '../../types'
import { useUpdateProcurementMode } from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementModes'
import {
  mapFormDataToUpdatePayload,
  mapProcurementModeToDisplay,
} from '@/lib/fiscal-year-and-policies/mappers/procurementModesMappers'
import type { ProcurementMode } from '@/lib/fiscal-year-and-policies/procurement-threshold.types'

interface EditModeOfProcurementDialogProps {
  mode: ModeOfProcurement
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditSuccess?: (data: ModeOfProcurement) => void
  existingModes?: ModeOfProcurement[]
}

export function EditModeOfProcurementDialog({
  mode,
  open,
  onOpenChange,
  onEditSuccess,
  existingModes = [],
}: EditModeOfProcurementDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useUpdateProcurementMode()

  const handleSubmit = async (data: ModeOfProcurementFormData) => {
    try {
      const payload = mapFormDataToUpdatePayload(data)

      const response = await mutateAsync(
        {
          pathParams: { id: mode.id },
          payload,
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) =>
                query.queryKey.some(
                  (key) =>
                    typeof key === 'string' &&
                    key.includes('/procurement-modes'),
                ),
            })
          },
        },
      )

      const mappedData = mapProcurementModeToDisplay(
        response.data as ProcurementMode,
      )
      onOpenChange(false)
      onEditSuccess?.(mappedData)
      toast({
        title: 'Success',
        description:
          response.message || 'Procurement mode has been updated successfully.',
        color: 'success',
      })
    } catch (error) {
      console.error('Error updating mode of procurement:', error)
      toast({
        title: 'Error',
        description: 'Error updating mode of procurement. Please try again.',
        color: 'destructive',
      })
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Procurement Mode"
      description="Update procurement mode details"
      footer={null}
      showCloseButton
    >
      <ModeOfProcurementForm
        initialData={{
          name: mode.modeName || '',
          description: mode.description,
          procurementCategoryId: mode.categoryId,
          isActive: mode.isActive,
          minThreshold:
            mode.minThreshold != null ? String(mode.minThreshold) : '',
          maxThreshold:
            mode.maxThreshold != null ? String(mode.maxThreshold) : '',
        }}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
        isLoading={isPending}
        isEditing={true}
        isCreating={false}
        existingModes={existingModes}
        currentModeId={mode.id}
      />
    </ResponsiveDialog>
  )
}

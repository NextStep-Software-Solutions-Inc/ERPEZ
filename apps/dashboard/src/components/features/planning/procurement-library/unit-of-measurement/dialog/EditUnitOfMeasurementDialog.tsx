import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import PermissionCheck from '@/components/PermissionCheck'
import { UnitOfMeasurementForm } from './UnitOfMeasurementForm'
import type { ParentUnitOption } from './UnitOfMeasurementForm'
import { useToast } from '@/components/ui/use-toast'
import { useUpdateUOM } from '../useUnitOfMeasurement'
import type { UnitOfMeasurement } from '../../types'
import type { UnitOfMeasurementFormData } from '../../types'
import type { MetaActions } from '@/types/global'

interface EditUnitOfMeasurementDialogProps {
  actions: MetaActions
  uom: UnitOfMeasurement
  open: boolean
  onOpenChange: (open: boolean) => void
  parentUnits?: ParentUnitOption[]
  onUpdateSuccess?: () => void
  onRefresh?: () => void
}

export function EditUnitOfMeasurementDialog({
  actions,
  uom,
  open,
  onOpenChange,
  parentUnits = [],
  onUpdateSuccess,
  onRefresh,
}: EditUnitOfMeasurementDialogProps) {
  const { toast } = useToast()

  const { mutate: updateUOM, isPending } = useUpdateUOM()

  const handleSubmit = (data: UnitOfMeasurementFormData) => {
    updateUOM(
      {
        pathParams: { id: uom.id },
        payload: {
          name: data.name ?? null,
          code: data.abbreviation ?? null,
          conversionFactor: data.conversionFactor ?? null,
          parentId: data.parentUnitId ?? null,
        },
      },
      {
        onSuccess: () => {
          onUpdateSuccess?.()
          onRefresh?.()
          onOpenChange(false)
          toast({
            title: 'Success',
            description: 'Unit of Measurement updated successfully.',
            color: 'warning',
          })
        },
        onError: (error: unknown) => {
          console.error('Error updating UOM:', error)
          toast({
            title: 'Error',
            description: 'Error updating Unit of Measurement. Please try again.',
          })
        },
      }
    )
  }

  const initialData: UnitOfMeasurementFormData = {
    name: uom.name,
    abbreviation: uom.abbreviation,
    parentUnitId: uom.parentUnitId,
    conversionFactor: uom.conversionFactor,
    status: uom.isActive ? 'active' : 'inactive',
  }

  return (
    <PermissionCheck action="write" actions={actions}>
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Edit Unit of Measurement"
        description="Update unit of measurement details"
        footer={null}
        showCloseButton
      >
        <UnitOfMeasurementForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          initialData={initialData}
          isLoading={isPending}
          parentUnits={parentUnits}
        />
      </ResponsiveDialog>
    </PermissionCheck>
  )
}
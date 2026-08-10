import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import PermissionCheck from '@/components/PermissionCheck'
import { UnitOfMeasurementForm } from './UnitOfMeasurementForm'
import type { ParentUnitOption } from './UnitOfMeasurementForm'
import { useToast } from '@/components/ui/use-toast'
import { useCreateUOM } from '../useUnitOfMeasurement'
import type { UnitOfMeasurementFormData } from '../../types'
import type { MetaActions } from '@/types/global'

interface CreateUnitOfMeasurementDialogProps {
  actions: MetaActions
  parentUnits?: ParentUnitOption[]
  onCreateSuccess?: () => void
  onRefresh?: () => void
}

export function CreateUnitOfMeasurementDialog({
  actions,
  parentUnits = [],
  onCreateSuccess,
  onRefresh,
}: CreateUnitOfMeasurementDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const { mutate: createUOM, isPending } = useCreateUOM()

  const handleSubmit = (data: UnitOfMeasurementFormData) => {
    createUOM(
      {
        pathParams: {},
        payload: {
          name: data.name ?? null,
          code: data.abbreviation ?? null,
          conversionFactor: data.conversionFactor ?? null,
          parentId: data.parentUnitId ?? null,
        },
      },
      {
        onSuccess: () => {
          onCreateSuccess?.()
          onRefresh?.()
          setOpen(false)
          toast({
            title: 'Success',
            description: 'Unit of Measurement created successfully.',
            color: 'success',
          })
        },
        onError: (error: unknown) => {
          console.error('Error creating UOM:', error)
          toast({
            title: 'Error',
            description: 'Error creating Unit of Measurement. Please try again.',
          })
        },
      }
    )
  }

  return (
    <PermissionCheck action="write" actions={actions}>
      <ResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        title="Add Unit of Measurement"
        description="Create a new unit of measurement entry"
        trigger={
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add UOM
          </Button>
        }
        footer={null}
        showCloseButton
      >
        <UnitOfMeasurementForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isLoading={isPending}
          isCreating={true}
          parentUnits={parentUnits}
        />
      </ResponsiveDialog>
    </PermissionCheck>
  )
}
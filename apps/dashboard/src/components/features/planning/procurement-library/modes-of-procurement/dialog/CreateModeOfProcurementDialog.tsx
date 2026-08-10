import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import PermissionCheck from '@/components/PermissionCheck'
import {
  useQueryClient,
} from 'erpez-shared-lib'
import { ModeOfProcurementForm } from './ModeOfProcurementForm'
import { useToast } from '@/components/ui/use-toast'
import type { ModeOfProcurementFormData, ModeOfProcurement } from '../../types'
import type { MetaActions } from '@/types/global'
import { useCreateProcurementMode } from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementModes'
import { mapFormDataToCreatePayload, mapProcurementModeToDisplay } from '@/lib/fiscal-year-and-policies/mappers/procurementModesMappers'
import type { ProcurementMode } from '@/lib/fiscal-year-and-policies/procurement-threshold.types'

interface CreateModeOfProcurementDialogProps {
  actions: MetaActions
  onCreateSuccess?: (data: ModeOfProcurement) => void
  existingModes?: ModeOfProcurement[]
}

export function CreateModeOfProcurementDialog({
  actions,
  onCreateSuccess,
  existingModes = [],
}: CreateModeOfProcurementDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const { mutateAsync, isPending } = useCreateProcurementMode()

  const handleSubmit = async (data: ModeOfProcurementFormData) => {
    try {
      const payload = mapFormDataToCreatePayload(data)

      const response = await mutateAsync({
      pathParams: {},
      payload,
      })

      // Invalidate relevant queries after successful creation
      void queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey.some(
        (key) =>
          typeof key === 'string' &&
          key.includes('/procurement-modes'),
        ),
      })

      const mappedData = mapProcurementModeToDisplay(response.data as ProcurementMode)
      onCreateSuccess?.(mappedData)

      toast({
      title: 'Success',
      description: response.message || 'Procurement mode has been created successfully.',
      color: 'success',
      })

      // Only close the dialog on success
      setOpen(false)
    } catch (error) {
      console.error('Error creating mode of procurement:', error)

      const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
        ? error
        : 'Error creating mode of procurement. Please try again.'

      toast({
      title: 'Error',
      description: message,
      color: 'destructive',
      })
      // Do not close the dialog so the user can fix/inspect their input
    }
  }

  return (
    <PermissionCheck action="write" actions={actions}>
      <ResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        title="Add Procurement Mode"
        description="Create a new procurement mode"
        trigger={
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Mode
          </Button>
        }
        footer={null}
        showCloseButton
      >
        <ModeOfProcurementForm 
          onSubmit={handleSubmit} 
          onCancel={() => setOpen(false)} 
          isLoading={isPending} 
          isCreating={true}
          existingModes={existingModes}
        />
      </ResponsiveDialog>
    </PermissionCheck>
  )
}

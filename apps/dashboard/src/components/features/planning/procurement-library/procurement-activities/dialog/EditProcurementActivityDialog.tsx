import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ProcurementActivityForm } from './ProcurementActivityForm'
import { useToast } from '@/components/ui/use-toast'
import type { ProcurementActivity, ProcurementActivityFormData } from '../../types'
import type { MetaActions } from '@/types/global'
import { useUpdateProcurementActivityType } from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementActivityTypes'

interface EditProcurementActivityDialogProps {
  activity: ProcurementActivity
  actions: MetaActions
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditSuccess: (data: ProcurementActivityFormData, activityId: string) => void
}

export function EditProcurementActivityDialog({
  activity,
  actions: _actions,
  open,
  onOpenChange,
  onEditSuccess,
}: EditProcurementActivityDialogProps) {
  const { toast } = useToast()
  const { mutate: updateActivityType, isPending } = useUpdateProcurementActivityType()

  const handleSubmit = async (data: ProcurementActivityFormData) => {
    updateActivityType(
      {
        pathParams: { id: activity.id },
        payload: {
          name: data.activityName,
          description: data.description || null,
          minDays: data.minDays,
          maxDays: data.maxDays,
        },
      },
      {
        onSuccess: () => {
          onEditSuccess(data, activity.id)
          onOpenChange(false)
        },
        onError: (error) => {
          console.error('Error updating procurement activity:', error)
          toast({
            title: 'Error',
            description: 'Error updating procurement activity. Please try again.',
            color: 'destructive',
          })
        },
      }
    )
  }

  const initialData: ProcurementActivityFormData = {
    activityName: activity.activityName,
    description: activity.description || '',
    minDays: activity.minDays,
    maxDays: activity.maxDays,
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Procurement Activity"
      description="Update procurement activity details"
      footer={null}
      showCloseButton
    >
      <ProcurementActivityForm
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
        initialData={initialData}
        isLoading={isPending}
      />
    </ResponsiveDialog>
  )
}
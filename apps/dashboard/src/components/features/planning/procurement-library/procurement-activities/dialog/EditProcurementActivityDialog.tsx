import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ProcurementActivityForm } from './ProcurementActivityForm'
import { useToast } from '@/components/ui/use-toast'
import type { ProcurementActivity, ProcurementActivityFormData } from '../../types'
import type { MetaActions } from '@/types/global'
import { useUpdateProcurementActivityType } from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementActivityTypes'
import { useState } from 'react'

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const { mutate: updateActivityType, isPending } = useUpdateProcurementActivityType()

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      setFieldErrors({})
    }
  }

  const handleSubmit = async (data: ProcurementActivityFormData) => {
    setFieldErrors({})
    updateActivityType(
      {
        pathParams: { id: activity.id },
        payload: {
          name: data.activityName,
          activityCode: data.activityCode,
          description: data.description || null,
          minDays: data.minDays,
          maxDays: data.maxDays,
        },
      },
      {
        onSuccess: () => {
          setFieldErrors({})
          onEditSuccess(data, activity.id)
          onOpenChange(false)
        },
        onError: (error: any) => {
          console.error('Error updating procurement activity:', error)
          const errorMsg = error?.response?.data?.message || error?.message || ''
          if (error?.response?.status === 409 || errorMsg.toLowerCase().includes('code')) {
            setFieldErrors({
              activityCode: errorMsg || 'Activity code already exists.',
            })
          } else {
            toast({
              title: 'Error',
              description: errorMsg || 'Error updating procurement activity. Please try again.',
              color: 'destructive',
            })
          }
        },
      }
    )
  }

  const initialData: ProcurementActivityFormData = {
    activityName: activity.activityName,
    activityCode: activity.activityCode || '',
    description: activity.description || '',
    minDays: activity.minDays,
    maxDays: activity.maxDays,
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Edit Procurement Activity"
      description="Update procurement activity details"
      footer={null}
      showCloseButton
    >
      <ProcurementActivityForm
        onSubmit={handleSubmit}
        onCancel={() => handleOpenChange(false)}
        initialData={initialData}
        isLoading={isPending}
        externalErrors={fieldErrors}
      />
    </ResponsiveDialog>
  )
}
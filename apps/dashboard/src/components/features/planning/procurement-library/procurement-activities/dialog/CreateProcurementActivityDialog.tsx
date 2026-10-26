import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import PermissionCheck from '@/components/PermissionCheck'
import { ProcurementActivityForm } from './ProcurementActivityForm'
import { useToast } from '@/components/ui/use-toast'
import type { ProcurementActivityFormData } from '../../types'
import type { MetaActions } from '@/types/global'
import { useCreateProcurementActivityType } from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementActivityTypes'

interface CreateProcurementActivityDialogProps {
  actions: MetaActions
  onCreateSuccess?: (data: ProcurementActivityFormData) => void
}

export function CreateProcurementActivityDialog({
  actions,
  onCreateSuccess,
}: CreateProcurementActivityDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const { mutate: createActivityType, isPending } = useCreateProcurementActivityType()

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setFieldErrors({})
    }
  }

  const handleSubmit = async (data: ProcurementActivityFormData) => {
    setFieldErrors({})
    createActivityType(
      {
        pathParams: {},
        payload: {
          name: data.activityName,
          activityCode: data.activityCode,
          description: data.description || '',
          minDays: data.minDays,
          maxDays: data.maxDays,
        },
      },
      {
        onSuccess: () => {
          setFieldErrors({})
          onCreateSuccess?.(data)
          setOpen(false)
        },
        onError: (error: any) => {
          console.error('Error creating procurement activity:', error)
          const errorMsg = error?.response?.data?.message || error?.message || ''
          if (error?.response?.status === 409 || errorMsg.toLowerCase().includes('code')) {
            setFieldErrors({
              activityCode: errorMsg || 'Activity code already exists.',
            })
          } else {
            toast({
              title: 'Error',
              description: errorMsg || 'Error creating procurement activity. Please try again.',
              color: 'destructive',
            })
          }
        },
      }
    )
  }

  return (
    <PermissionCheck action="write" actions={actions}>
      <ResponsiveDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Add Procurement Activity"
        description="Create a new procurement activity"
        trigger={
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Activity
          </Button>
        }
        footer={null}
        showCloseButton
      >
        <ProcurementActivityForm
          onSubmit={handleSubmit}
          onCancel={() => handleOpenChange(false)}
          isLoading={isPending}
          externalErrors={fieldErrors}
        />
      </ResponsiveDialog>
    </PermissionCheck>
  )
}
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
  const { mutate: createActivityType, isPending } = useCreateProcurementActivityType()

  const handleSubmit = async (data: ProcurementActivityFormData) => {
    createActivityType(
      {
        pathParams: {},
        payload: {
          name: data.activityName,
          description: data.description || '',
          minDays: data.minDays,
          maxDays: data.maxDays,
        },
      },
      {
        onSuccess: () => {
          onCreateSuccess?.(data)
          setOpen(false)
        },
        onError: (error) => {
          console.error('Error creating procurement activity:', error)
          toast({
            title: 'Error',
            description: 'Error creating procurement activity. Please try again.',
            color: 'destructive',
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
        <ProcurementActivityForm onSubmit={handleSubmit} onCancel={() => setOpen(false)} isLoading={isPending} />
      </ResponsiveDialog>
    </PermissionCheck>
  )
}
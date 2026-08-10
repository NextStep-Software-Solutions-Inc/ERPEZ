import { useState } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { UpdateObjectCodeForm, type UpdateObjectCodeFormValues } from '../forms/UpdateObjectCodeForm'
import { toast } from 'sonner'
import type { ObjectCode } from '../types/objectCodeTypes'

interface UpdateObjectCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  objectCode?: ObjectCode
  onSuccess?: (data: UpdateObjectCodeFormValues) => void
}

export function UpdateObjectCodeDialog({
  open,
  onOpenChange,
  objectCode,
  onSuccess,
}: UpdateObjectCodeDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: UpdateObjectCodeFormValues) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      toast.success(`Object Code "${data.name}" updated successfully!`)
      onOpenChange(false)
      onSuccess?.(data)
    } catch (err) {
      toast.error('Failed to update object code.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Object Code"
      description="Update the details of the object code."
      size="sm"
      showCloseButton
    >
      <UpdateObjectCodeForm
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
        isLoading={isLoading}
        initialData={objectCode}
      />
    </ResponsiveDialog>
  )
}

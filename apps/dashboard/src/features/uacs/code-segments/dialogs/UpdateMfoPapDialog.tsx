import { useState } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { UpdateMfoPapForm, type UpdateMfoPapFormValues } from '../forms/UpdateMfoPapForm'
import { toast } from 'sonner'
import type { MfoPap } from '../types/mfoPapTypes'

interface UpdateMfoPapDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mfoPap?: MfoPap
  onSuccess?: (data: UpdateMfoPapFormValues) => void
}

export function UpdateMfoPapDialog({
  open,
  onOpenChange,
  mfoPap,
  onSuccess,
}: UpdateMfoPapDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: UpdateMfoPapFormValues) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      toast.success(`MFO/PAP "${data.name}" updated successfully!`)
      onOpenChange(false)
      onSuccess?.(data)
    } catch (err) {
      toast.error('Failed to update MFO/PAP.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit MFO/PAP"
      description="Update the details of the MFO/PAP code."
      size="sm"
      showCloseButton
    >
      <UpdateMfoPapForm
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
        isLoading={isLoading}
        initialData={mfoPap}
      />
    </ResponsiveDialog>
  )
}

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useState } from 'react'
import { toast } from 'sonner'
import type { MfoPap } from '../types/mfoPapTypes'

interface DeleteMfoPapDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mfoPap?: MfoPap
  onSuccess?: (id: string) => void
}

export function DeleteMfoPapDialog({
  open,
  onOpenChange,
  mfoPap,
  onSuccess,
}: DeleteMfoPapDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    if (!mfoPap?.id) return

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      toast.success(`MFO/PAP "${mfoPap.name}" deleted successfully!`)
      onOpenChange(false)
      onSuccess?.(mfoPap.id)
    } catch (err) {
      toast.error('Failed to delete MFO/PAP.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete MFO/PAP?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{mfoPap?.name}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end gap-3">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

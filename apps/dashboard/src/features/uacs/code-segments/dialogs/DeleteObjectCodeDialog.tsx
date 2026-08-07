import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useState } from 'react'
import { toast } from 'sonner'
import type { ObjectCode } from '../types/objectCodeTypes'

interface DeleteObjectCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  objectCode?: ObjectCode
  onSuccess?: (id: string) => void
}

export function DeleteObjectCodeDialog({
  open,
  onOpenChange,
  objectCode,
  onSuccess,
}: DeleteObjectCodeDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    if (!objectCode?.id) return

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      toast.success(`Object Code "${objectCode.name}" deleted successfully!`)
      onOpenChange(false)
      onSuccess?.(objectCode.id)
    } catch (err) {
      toast.error('Failed to delete object code.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Object Code?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{objectCode?.name}"? This action cannot be undone.
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

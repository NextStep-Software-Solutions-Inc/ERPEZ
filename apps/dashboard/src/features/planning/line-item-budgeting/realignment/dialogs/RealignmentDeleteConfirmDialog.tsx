import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import api from '@/services/api'
import { Loader2 } from 'lucide-react'

export interface DeleteContext {
  type: 'activity' | 'budget'
  activityId?: string
  budgetId?: string
  detailIds?: string[]
  name: string
}

interface RealignmentDeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deleteContext: DeleteContext | null
  onSuccess: () => Promise<void>
}

export function RealignmentDeleteConfirmDialog({
  open,
  onOpenChange,
  deleteContext,
  onSuccess,
}: RealignmentDeleteConfirmDialogProps) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteConfirm = async () => {
    if (!deleteContext) return

    const { type, activityId, budgetId, detailIds } = deleteContext
    setIsDeleting(true)

    try {
      if (type === 'budget' && (detailIds?.length || budgetId)) {
        const idsToDelete = detailIds && detailIds.length > 0 ? detailIds : [budgetId!]
        await Promise.all(
          idsToDelete.map((id) => api.delete(`/line-item-budget-details/${id}`)),
        )
        toast({
          title: 'Deleted Successfully',
          description: 'The budget line item has been deleted.',
        })
        await onSuccess()
      } else if (type === 'activity' && activityId) {
        await api.delete(`/lib-activities/${activityId}`)
        toast({
          title: 'Deleted Successfully',
          description: 'The operational activity has been deleted.',
        })
        await onSuccess()
      }
    } catch (err) {
      console.error('Failed to delete element:', err)
      toast({
        title: 'Error',
        description: 'Failed to delete selected item. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-bold">
            Confirm Deletion
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            Are you sure you want to delete/remove <strong>{deleteContext?.name}</strong> from this budget realignment plan?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="text-xs h-9">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white text-xs h-9"
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

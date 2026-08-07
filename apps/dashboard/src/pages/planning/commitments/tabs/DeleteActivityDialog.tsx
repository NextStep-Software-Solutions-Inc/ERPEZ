import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activityName: string
  onConfirm: () => void
  isLoading?: boolean
}

export function DeleteActivityDialog({
  open,
  onOpenChange,
  activityName,
  onConfirm,
  isLoading = false,
}: DeleteActivityDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>Delete Activity</AlertDialogTitle>
        <AlertDialogDescription className="space-y-3">
          <p>
            Are you sure you want to delete this activity?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm font-semibold text-red-900">
              {activityName}
            </p>
          </div>
          <p className="text-sm text-gray-600">
            This action cannot be undone. The activity will be permanently deleted.
          </p>
        </AlertDialogDescription>
        <div className="flex gap-3 justify-end">
          <AlertDialogCancel disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

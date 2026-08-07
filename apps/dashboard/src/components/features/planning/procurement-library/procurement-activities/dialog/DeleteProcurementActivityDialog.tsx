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

interface DeleteProcurementActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activityName: string
  onConfirm: () => void
  isLoading?: boolean
}

export function DeleteProcurementActivityDialog({
  open,
  onOpenChange,
  activityName,
  onConfirm,
  isLoading = false,
}: DeleteProcurementActivityDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Procurement Activity</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>Are you sure you want to delete this procurement activity?</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-red-900">{activityName}</p>
            </div>
            <p className="text-sm text-gray-600">
              This action cannot be undone. The activity will be permanently deleted from the
              procurement library.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async (e: any) => {
              e.preventDefault()
              try {
                await onConfirm()
                onOpenChange(false)
              } catch (err) {
                console.error('Failed to delete procurement activity', err)
                // keep the dialog open so the user can see the error and retry
              }
            }}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

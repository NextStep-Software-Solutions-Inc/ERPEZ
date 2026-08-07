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

interface DeleteUnitOfMeasurementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  uomName: string
  onConfirm: () => void
  isLoading?: boolean
}

export function DeleteUnitOfMeasurementDialog({
  open,
  onOpenChange,
  uomName,
  onConfirm,
  isLoading = false,
}: DeleteUnitOfMeasurementDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Unit of Measurement</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <span className="font-semibold text-foreground">{uomName}</span>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} className="bg-white text-foreground hover:bg-gray-100 border border-gray-300">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
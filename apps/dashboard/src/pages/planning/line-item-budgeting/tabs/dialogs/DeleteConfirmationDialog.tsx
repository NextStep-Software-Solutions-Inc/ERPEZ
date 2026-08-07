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

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ceilingName: string
  onConfirm: () => void
  isLoading?: boolean
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  ceilingName,
  onConfirm,
  isLoading = false,
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Ceiling Allocation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the ceiling allocation for <span className="font-semibold text-foreground">{ceilingName}</span>? 
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

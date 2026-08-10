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

interface UNSPSCodeStatusToggleConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  codeName: string
  currentStatus: 'active' | 'inactive'
  onConfirm: () => void
  isLoading?: boolean
}

export function UNSPSCodeStatusToggleConfirmationDialog({
  open,
  onOpenChange,
  codeName,
  currentStatus,
  onConfirm,
  isLoading = false,
}: UNSPSCodeStatusToggleConfirmationDialogProps) {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  const action = newStatus === 'active' ? 'Activate' : 'Deactivate'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{action} UNSPSC Code</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {action.toLowerCase()} <span className="font-semibold text-foreground">{codeName}</span>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} className="bg-white text-foreground hover:bg-gray-100 border border-gray-300">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={newStatus === 'active' ? "bg-green-600 text-white hover:bg-green-700" : "bg-orange-600 text-white hover:bg-orange-700"}
          >
            {isLoading ? `${action}ing...` : action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
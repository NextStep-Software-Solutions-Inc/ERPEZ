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

interface LIBApprovalDialogProps {
  open: boolean
  libName: string
  action: 'approve' | 'reject'
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export const LIBApprovalDialog = ({
  open,
  libName,
  action,
  onConfirm,
  onCancel,
  isLoading,
}: LIBApprovalDialogProps) => {
  const isApprove = action === 'approve'

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isApprove ? 'Approve LIB?' : 'Reject LIB?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isApprove
              ? `Are you sure you want to approve "${libName}"? This action will update the LIB status to Approved.`
              : `Are you sure you want to reject "${libName}"? This action will require resubmission.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={
              isApprove
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-orange-600 hover:bg-orange-700'
            }
          >
            {isLoading ? 'Processing...' : isApprove ? 'Approve' : 'Reject'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

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
  action: 'approve' | 'return' | 'reject'
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
            {isApprove ? 'Approve Line-Item Budget?' : 'Return Line-Item Budget?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isApprove
              ? `Are you sure you want to approve "${libName}"? This action will update the LIB status to Approved.`
              : `Are you sure you want to return "${libName}"? This action will set the status to Returned so the end-user can revise and resubmit.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={
              isApprove
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-medium'
                : 'bg-amber-600 hover:bg-amber-700 text-white font-medium'
            }
          >
            {isLoading
              ? 'Processing...'
              : isApprove
                ? 'Approve LIB'
                : 'Return LIB'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

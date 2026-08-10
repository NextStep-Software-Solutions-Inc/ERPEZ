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

interface DeleteSubModeConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subModeName: string
  parentModeName: string | null
  onConfirm: () => void
}

export function DeleteSubModeConfirmationDialog({
  open,
  onOpenChange,
  subModeName,
  parentModeName,
  onConfirm,
}: DeleteSubModeConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Sub-Procurement Mode</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Are you sure you want to delete the sub-mode{' '}
                <span className="font-semibold text-foreground">
                  "{subModeName}"
                </span>
                {parentModeName && (
                  <>
                    {' '}from{' '}
                    <span className="font-semibold text-foreground">
                      {parentModeName}
                    </span>
                  </>
                )}
                ?
              </p>
              <p className="text-destructive font-medium">
                This action cannot be undone.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-white text-foreground hover:bg-gray-100 border border-gray-300">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Sub-Mode
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

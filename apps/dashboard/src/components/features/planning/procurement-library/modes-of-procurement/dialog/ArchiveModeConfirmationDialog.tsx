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

interface ArchiveModeConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  modeName: string
  isArchiving: boolean
  onConfirm: () => void
  isLoading?: boolean
}

export function ArchiveModeConfirmationDialog({
  open,
  onOpenChange,
  modeName,
  isArchiving,
  onConfirm,
  isLoading = false,
}: ArchiveModeConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isArchiving ? 'Archive Procurement Mode' : 'Restore Procurement Mode'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {isArchiving ? 'archive' : 'restore'}{' '}
            <span className="font-semibold text-foreground">{modeName}</span>?
            {isArchiving
              ? ' This will change its status to inactive and move it to the archive.'
              : ' This will change its status to active and restore it from the archive.'
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} className="bg-white text-foreground hover:bg-gray-100 border border-gray-300">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={isArchiving ? "bg-orange-600 text-white hover:bg-orange-700" : "bg-green-600 text-white hover:bg-green-700"}
          >
            {isLoading ? (isArchiving ? 'Archiving...' : 'Restoring...') : (isArchiving ? 'Archive' : 'Restore')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
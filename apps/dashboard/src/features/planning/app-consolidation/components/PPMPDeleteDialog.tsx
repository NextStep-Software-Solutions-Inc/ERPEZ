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

interface PPMPDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function PPMPDeleteDialog({ open, onOpenChange, onConfirm }: PPMPDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="z-[99999] pointer-events-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Remove PPMP Item?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove this PPMP item? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="pointer-events-auto cursor-pointer">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="pointer-events-auto cursor-pointer bg-red-600 hover:bg-red-700"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

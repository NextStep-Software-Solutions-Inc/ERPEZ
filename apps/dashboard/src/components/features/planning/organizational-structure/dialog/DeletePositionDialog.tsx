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
import { AlertTriangle } from 'lucide-react'
import { useDeletePosition, usePosition } from '@/pages/planning/organization/hooks/useOrgUnits'
import { toast } from 'sonner'

interface DeletePositionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  positionId?: string
  onSuccess?: () => void
}

export default function DeletePositionDialog({
  open,
  onOpenChange,
  positionId,
  onSuccess,
}: DeletePositionDialogProps) {
  const positionQuery = usePosition(positionId || '', open && !!positionId)
  const position = positionQuery.data
  const deleteMutation = useDeletePosition()

  const handleConfirmDelete = async () => {
    if (!positionId) return

    toast.promise(
      deleteMutation.mutateAsync(positionId),
      {
        loading: 'Deleting position...',
        success: () => {
          onOpenChange(false)
          onSuccess?.()
          return `Position "${position?.title || 'Position'}" has been deleted successfully`
        },
        error: (error) => {
          return error instanceof Error ? error.message : 'Failed to delete position'
        },
      },
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
            <AlertDialogTitle>Delete Position</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm mt-2">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">
              "{position?.title || 'this position'}"
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

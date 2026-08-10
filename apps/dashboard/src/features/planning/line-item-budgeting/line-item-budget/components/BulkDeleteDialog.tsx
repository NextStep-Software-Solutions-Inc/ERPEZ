import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface BulkDeleteDialogProps {
  open: boolean
  count: number
  onConfirm: () => void
  onCancel: () => void
}

export const BulkDeleteDialog = ({
  open,
  count,
  onConfirm,
  onCancel,
}: BulkDeleteDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="text-xl text-red-600">
            Delete LIBs
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {count} LIB{count !== 1 ? 's' : ''}?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div
          className="flex gap-3 justify-end pt-4"
          onClick={(e) => e.stopPropagation()}
        >
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="outline"
            className="text-red-600 hover:bg-red-50 border-red-200"
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

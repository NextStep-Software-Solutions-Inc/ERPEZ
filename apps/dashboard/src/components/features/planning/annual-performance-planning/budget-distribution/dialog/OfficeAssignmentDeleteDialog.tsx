/**
 * Office Assignment Delete Dialog
 * Confirmation dialog for deleting office-added assignments
 */

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface OfficeAssignmentDeleteDialogProps {
  open: boolean
  assignmentId?: string
  kpiName?: string
  onOpenChange: (open: boolean) => void
  onConfirm: (assignmentId: string) => void
}

export function OfficeAssignmentDeleteDialog({
  open,
  assignmentId,
  kpiName,
  onOpenChange,
  onConfirm,
}: OfficeAssignmentDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Target Assignment</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 py-4">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <DialogDescription className="text-base text-gray-700">
            Are you sure you want to delete <span className="font-semibold">{kpiName}</span> from
            your office assignments? This action cannot be undone.
          </DialogDescription>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => {
              if (assignmentId) {
                onConfirm(assignmentId)
                onOpenChange(false)
              }
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

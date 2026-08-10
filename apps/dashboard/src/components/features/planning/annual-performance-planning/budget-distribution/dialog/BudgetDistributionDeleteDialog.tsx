/**
 * Budget Distribution Delete Dialog
 * Confirmation dialog for deleting budget allocations
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

interface BudgetDistributionDeleteDialogProps {
  open: boolean
  allocationId?: string
  officeName?: string
  onOpenChange: (open: boolean) => void
  onConfirm: (allocationId: string) => void
}

export function BudgetDistributionDeleteDialog({
  open,
  allocationId,
  officeName,
  onOpenChange,
  onConfirm,
}: BudgetDistributionDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Budget Allocation</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 py-4">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <DialogDescription className="text-base text-gray-700">
            Are you sure you want to delete this budget allocation for{' '}
            <span className="font-semibold">{officeName}</span>? This action cannot be undone.
          </DialogDescription>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            color="destructive"
            onClick={() => {
              if (allocationId) {
                onConfirm(allocationId)
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

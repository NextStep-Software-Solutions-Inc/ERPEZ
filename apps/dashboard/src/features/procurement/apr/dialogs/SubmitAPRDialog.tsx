/**
 * Submit APR Dialog
 * Confirmation dialog for submitting APR for review
 */

import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface SubmitAPRDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apr: any | null
  isSubmitting?: boolean
  onConfirm?: () => void | Promise<void>
}

export function SubmitAPRDialog({
  open,
  onOpenChange,
  apr,
  isSubmitting = false,
  onConfirm,
}: SubmitAPRDialogProps) {
  if (!apr) return null

  const itemsCount = apr.consolidatedItems?.length ?? apr.itemCount ?? apr.totalItemsCount ?? 0
  const totalAmount = apr.totalAmount ?? 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit APR for Review</DialogTitle>
          <DialogDescription>
            Review the APR details before submitting for approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/35 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-blue-900 dark:text-blue-200">APR Ready to Submit</p>
                <p className="text-sm text-blue-700 dark:text-blue-300/90 mt-1">
                  {apr.aprNumber} will be sent for review and assigned an official tracking number.
                </p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Items:</span>
              <span className="font-medium text-foreground">{itemsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-medium text-foreground tabular-nums">
                ₱{new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalAmount)}
              </span>
            </div>
            {apr.fiscalYear && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fiscal Year:</span>
                <span className="font-medium text-foreground">{apr.fiscalYear}</span>
              </div>
            )}
          </div>

          {/* Confirmation */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-border rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              Once submitted, this APR will transition to FOR APPROVAL status and be submitted to the approval authority.
            </p>
          </div>
        </div>

        {/* Actions */}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? 'Submitting...' : 'Submit APR'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

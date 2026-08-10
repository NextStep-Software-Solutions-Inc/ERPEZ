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
import type { APRMaster } from '../types'

interface SubmitAPRDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apr: APRMaster | null
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-blue-900">APR Ready to Submit</p>
                <p className="text-sm text-blue-700 mt-1">
                  {apr.aprNumber} will be sent for review
                </p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Items:</span>
              <span className="font-medium">{apr.consolidatedItems.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium">{apr.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fiscal Year:</span>
              <span className="font-medium">{apr.fiscalYear}</span>
            </div>
          </div>

          {/* Confirmation */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              Once submitted, this APR will be sent for review. You can track its status and make revisions if needed.
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Submitting...' : 'Submit APR'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

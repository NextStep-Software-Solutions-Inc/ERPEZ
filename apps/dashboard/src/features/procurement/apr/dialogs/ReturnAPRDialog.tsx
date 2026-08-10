/**
 * Return APR Dialog
 * Dialog for returning APR to requester with comments
 */

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import type { APRMaster } from '../types'

interface ReturnAPRDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apr: APRMaster | null
  isSubmitting?: boolean
  onConfirm?: (remarks: string) => void | Promise<void>
}

export function ReturnAPRDialog({
  open,
  onOpenChange,
  apr,
  isSubmitting = false,
  onConfirm,
}: ReturnAPRDialogProps) {
  const [remarks, setRemarks] = useState('')

  if (!apr) return null

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm(remarks)
    }
  }

  const handleClose = () => {
    setRemarks('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Return APR for Revisions</DialogTitle>
          <DialogDescription>
            Provide feedback and send this APR back to the requester for revisions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-amber-900">
                Return for Revisions
              </p>
              <p className="text-sm text-amber-700 mt-1">
                This APR will be returned to the requester. Please provide specific feedback on what needs to be revised.
              </p>
            </div>
          </div>

          {/* APR Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2 text-sm">
            <div>
              <p className="text-gray-600">APR Number</p>
              <p className="font-medium text-gray-900">{apr.aprNumber}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Items</p>
              <p className="font-medium text-gray-900">{apr.consolidatedItems.length}</p>
            </div>
          </div>

          {/* Remarks Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Revision Remarks <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Explain what needs to be revised and any specific details the requester should address..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Be clear and specific to help the requester understand what changes are needed.
            </p>
          </div>
        </div>

        {/* Actions */}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || !remarks.trim()}
            variant="destructive"
          >
            {isSubmitting ? 'Returning...' : 'Return APR'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

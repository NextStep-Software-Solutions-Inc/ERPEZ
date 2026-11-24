import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PurchaseOrderReturnForm } from '../forms/PurchaseOrderReturnForm'

type ReturnPurchaseOrderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (reason: string) => void
  isSubmitting?: boolean
}

export function ReturnPurchaseOrderDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: ReturnPurchaseOrderDialogProps) {
  const [reason, setReason] = useState('')
  const isValid = reason.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Return Purchase Order</DialogTitle>
          <DialogDescription>
            Add a short explanation for the procurement staff before the record
            is routed back.
          </DialogDescription>
        </DialogHeader>

        <PurchaseOrderReturnForm reason={reason} onReasonChange={setReason} />

        <DialogFooter>
          <Button
            variant="outline"
            color="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            color="warning"
            disabled={!isValid || isSubmitting}
            onClick={() => {
              if (isValid) {
                onSubmit(reason.trim())
              }
            }}
          >
            {isSubmitting ? 'Returning...' : 'Return PO'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

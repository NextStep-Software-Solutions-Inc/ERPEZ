import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Send, FileText, Building2, DollarSign } from 'lucide-react'
import type { PurchaseOrder } from '../types'

type SubmitForApprovalPurchaseOrderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchaseOrder: PurchaseOrder | null
  onConfirm: (purchaseOrderId: string) => void
  isSubmitting?: boolean
}

export function SubmitForApprovalPurchaseOrderDialog({
  open,
  onOpenChange,
  purchaseOrder,
  onConfirm,
  isSubmitting = false,
}: SubmitForApprovalPurchaseOrderDialogProps) {
  if (!purchaseOrder) return null

  const handleConfirm = () => {
    onConfirm(purchaseOrder.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Submit for Approval
          </DialogTitle>
          <DialogDescription>
            You are about to submit this purchase order for approval. Please review the
            details below before proceeding. Once submitted, the PO will be routed to the
            approving authority.
          </DialogDescription>
        </DialogHeader>

        {/* PO Summary */}
        <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                PO Number
              </p>
              <p className="text-sm font-semibold">{purchaseOrder.poNumber}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Description
              </p>
              <p className="text-sm text-foreground line-clamp-2">{purchaseOrder.description}</p>
            </div>
          </div>

          {purchaseOrder.supplierName && (
            <div className="flex items-start gap-3">
              <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Supplier
                </p>
                <p className="text-sm text-foreground">{purchaseOrder.supplierName}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total Amount
              </p>
              <p className="text-sm font-semibold text-primary">
                ₱
                {purchaseOrder.totalAmount.toLocaleString('en-PH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          {purchaseOrder.sourceDocumentNumber && (
            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Source Reference
                </p>
                <p className="text-sm text-foreground">{purchaseOrder.sourceDocumentNumber}</p>
              </div>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          By clicking <span className="font-semibold text-foreground">Submit for Approval</span>,
          this PO will be marked as <span className="font-semibold">For Approval</span> and sent
          to the approving authority for review.
        </p>

        <DialogFooter>
          <Button variant="outline" color="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button className="gap-2" onClick={handleConfirm} disabled={isSubmitting}>
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

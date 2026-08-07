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
import { PurchaseOrderApprovalForm } from '../forms/PurchaseOrderApprovalForm'

type ApprovePurchaseOrderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (signedDocument: File) => void
}

export function ApprovePurchaseOrderDialog({
  open,
  onOpenChange,
  onSubmit,
}: ApprovePurchaseOrderDialogProps) {
  const [signedDocument, setSignedDocument] = useState<File | null>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Approve Purchase Order</DialogTitle>
          <DialogDescription>
            Upload the physically signed PO document before the approval can be
            completed.
          </DialogDescription>
        </DialogHeader>

        <PurchaseOrderApprovalForm
          signedDocument={signedDocument}
          onSignedDocumentChange={setSignedDocument}
        />

        <DialogFooter>
          <Button
            variant="outline"
            color="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={!signedDocument}
            onClick={() => {
              if (signedDocument) {
                onSubmit(signedDocument)
                setSignedDocument(null)
                onOpenChange(false)
              }
            }}
          >
            Approve PO
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

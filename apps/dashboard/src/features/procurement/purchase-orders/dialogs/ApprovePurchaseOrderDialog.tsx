import { useState, useEffect } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { PurchaseOrderApprovalForm } from '../forms/PurchaseOrderApprovalForm'

export type ApprovePurchaseOrderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (signedDocument: File) => void | Promise<void>
  isSubmitting?: boolean
  poNumber?: string
}

export function ApprovePurchaseOrderDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  poNumber,
}: ApprovePurchaseOrderDialogProps) {
  const [signedDocument, setSignedDocument] = useState<File | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [showDiscardWarning, setShowDiscardWarning] = useState(false)

  useEffect(() => {
    if (!open) {
      setSignedDocument(null)
      setIsDirty(false)
      setShowDiscardWarning(false)
    }
  }, [open])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isDirty && signedDocument) {
      setShowDiscardWarning(true)
      return
    }
    onOpenChange(nextOpen)
  }

  const handleDiscard = () => {
    setShowDiscardWarning(false)
    setIsDirty(false)
    setSignedDocument(null)
    onOpenChange(false)
  }

  return (
    <>
      <ResponsiveDialog
        open={open && !showDiscardWarning}
        onOpenChange={handleOpenChange}
        title="Approve Purchase Order"
        description={
          poNumber
            ? `Upload the physically signed PO document before approving ${poNumber}.`
            : 'Upload the physically signed PO document before the approval can be completed.'
        }
        size="md"
        showCloseButton
      >
        <PurchaseOrderApprovalForm
          signedDocument={signedDocument}
          onSignedDocumentChange={setSignedDocument}
          onSubmit={onSubmit}
          onCancel={() => handleOpenChange(false)}
          isSubmitting={isSubmitting}
          onDirtyChange={setIsDirty}
        />
      </ResponsiveDialog>

      <ConfirmAlertDialog
        open={showDiscardWarning}
        onOpenChange={setShowDiscardWarning}
        title="Discard signed document?"
        description="You have an unsaved signed PO document selected. Do you want to discard it?"
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        onConfirm={handleDiscard}
        onCancel={() => setShowDiscardWarning(false)}
      />
    </>
  )
}

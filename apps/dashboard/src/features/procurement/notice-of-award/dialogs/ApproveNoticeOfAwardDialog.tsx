import { useState } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import type { ApproveNoticeOfAwardPayload } from '../types'
import { ApproveNoticeOfAwardForm } from '../forms'

export type ApproveNoticeOfAwardDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  noaId: string
  noaNumber: string
  supplierName?: string
  totalAmount?: number
  onApprove: (values: ApproveNoticeOfAwardPayload) => Promise<void> | void
}

export function ApproveNoticeOfAwardDialog({
  open,
  onOpenChange,
  noaId,
  noaNumber,
  supplierName,
  totalAmount,
  onApprove,
}: ApproveNoticeOfAwardDialogProps) {
  const [isDirty, setIsDirty] = useState(false)
  const [showDiscardWarning, setShowDiscardWarning] = useState(false)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isDirty) {
      setShowDiscardWarning(true)
      return
    }

    onOpenChange(nextOpen)
  }

  return (
    <>
      <ResponsiveDialog
        open={open && !showDiscardWarning}
        onOpenChange={handleOpenChange}
        title="Approve Notice of Award"
        description={`Upload the physically signed NOA before approving and issuing ${noaNumber}.`}
        size="md"
        showCloseButton
      >
        <ApproveNoticeOfAwardForm
          noaId={noaId}
          noaNumber={noaNumber}
          supplierName={supplierName}
          totalAmount={totalAmount}
          onSubmit={onApprove}
          onCancel={() => handleOpenChange(false)}
          onDirtyChange={setIsDirty}
        />
      </ResponsiveDialog>

      <ConfirmAlertDialog
        open={showDiscardWarning}
        onOpenChange={setShowDiscardWarning}
        title="Discard signed upload?"
        description="You have an unsaved signed document selected. Do you want to discard it?"
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        onConfirm={() => {
          setShowDiscardWarning(false)
          setIsDirty(false)
          onOpenChange(false)
        }}
      />
    </>
  )
}

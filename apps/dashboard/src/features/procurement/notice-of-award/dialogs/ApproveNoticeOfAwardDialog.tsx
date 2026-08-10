import { useState } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import type { ApproveNoticeOfAwardPayload } from '../types'
import { ApproveNoticeOfAwardForm } from '../forms'

type ApproveNoticeOfAwardDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  noaId: string
  noaNumber: string
  onApprove: (values: ApproveNoticeOfAwardPayload) => Promise<void> | void
}

export function ApproveNoticeOfAwardDialog({
  open,
  onOpenChange,
  noaId,
  noaNumber,
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
        title="Approve NOA"
        description={`Upload the signed NOA before approving ${noaNumber}.`}
        size="lg"
        showCloseButton
      >
        <ApproveNoticeOfAwardForm
          noaId={noaId}
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

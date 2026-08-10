import { useState } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import type { ReturnNoticeOfAwardPayload } from '../types'
import { ReturnNoticeOfAwardForm } from '../forms'

type ReturnNoticeOfAwardDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  noaId: string
  noaNumber: string
  onReturn: (values: ReturnNoticeOfAwardPayload) => Promise<void> | void
}

export function ReturnNoticeOfAwardDialog({
  open,
  onOpenChange,
  noaId,
  noaNumber,
  onReturn,
}: ReturnNoticeOfAwardDialogProps) {
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
        title="Return NOA"
        description={`Return ${noaNumber} for revision with remarks.`}
        size="lg"
        showCloseButton
      >
        <ReturnNoticeOfAwardForm
          noaId={noaId}
          onSubmit={onReturn}
          onCancel={() => handleOpenChange(false)}
          onDirtyChange={setIsDirty}
        />
      </ResponsiveDialog>

      <ConfirmAlertDialog
        open={showDiscardWarning}
        onOpenChange={setShowDiscardWarning}
        title="Discard remarks?"
        description="You have unsaved return remarks. Do you want to discard them?"
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

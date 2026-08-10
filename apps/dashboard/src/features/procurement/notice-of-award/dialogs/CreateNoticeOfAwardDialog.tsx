import { useState } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import type {
  AwardBacResolutionSource,
  CreateNoticeOfAwardPayload,
} from '../types'
import { CreateNoticeOfAwardForm } from '../forms'

type CreateNoticeOfAwardDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableAwardBacResolutions: AwardBacResolutionSource[]
  onCreate: (values: CreateNoticeOfAwardPayload) => Promise<void> | void
}

export function CreateNoticeOfAwardDialog({
  open,
  onOpenChange,
  availableAwardBacResolutions,
  onCreate,
}: CreateNoticeOfAwardDialogProps) {
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
        open={open}
        onOpenChange={handleOpenChange}
        title="Create NOA"
        description="Draft from an approved Award Recommendation BAC Resolution."
        size="lg"
        showCloseButton
      >
        <CreateNoticeOfAwardForm
          key={open ? 'create-noa-open' : 'create-noa-closed'}
          availableAwardBacResolutions={availableAwardBacResolutions}
          onSubmit={onCreate}
          onCancel={() => handleOpenChange(false)}
          onDirtyChange={setIsDirty}
        />
      </ResponsiveDialog>

      <ConfirmAlertDialog
        open={showDiscardWarning}
        onOpenChange={setShowDiscardWarning}
        title="Discard draft?"
        description="You have unsaved NOA draft data. Do you want to discard it?"
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

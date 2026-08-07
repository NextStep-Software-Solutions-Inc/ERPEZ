import { useState } from 'react'
import { GenerateScheduleForm } from '../forms/GenerateScheduleForm'
import type { GenerateScheduleFormValues } from '../forms/GenerateScheduleForm'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

interface GenerateScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: GenerateScheduleFormValues) => Promise<void> | void
  mode?: 'generate' | 'regenerate'
  isSubmitting?: boolean
  isRegenerate?: boolean
}

export function GenerateScheduleDialog({
  open,
  onOpenChange,
  onSubmit,
  mode,
  isSubmitting = false,
  isRegenerate = false,
}: GenerateScheduleDialogProps) {
  const [isDirty, setIsDirty] = useState(false)
  const [showDiscardWarning, setShowDiscardWarning] = useState(false)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isDirty) {
      setShowDiscardWarning(true)
      return
    }
    onOpenChange(nextOpen)
  }

  const formId = 'generate-schedule-form'

  const activeMode = mode ?? (isRegenerate ? 'regenerate' : 'generate')

  const title = activeMode === 'regenerate'
    ? 'Regenerate Bidding Schedule'
    : 'Generate Bidding Schedule'

  const description = activeMode === 'regenerate'
    ? 'Update the IB Posting Date or category to recalculate the schedule. All existing milestones will be replaced.'
    : 'Set the IB Posting Date and procurement category to auto-calculate all milestone dates.'

  const submitLabel = activeMode === 'regenerate' ? 'Regenerate' : 'Generate'

  return (
    <>
      <ResponsiveDialogDashtail
        open={open && !showDiscardWarning}
        onOpenChange={handleOpenChange}
        title={title}
        description={description}
        size="md"
        showCloseButton
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button form={formId} type="submit" disabled={isSubmitting}>
              {submitLabel}
            </Button>
          </div>
        }
      >
        <GenerateScheduleForm
          formId={formId}
          onSubmit={onSubmit}
          isLoading={isSubmitting}
          onDirtyChange={setIsDirty}
        />
      </ResponsiveDialogDashtail>

      <ConfirmAlertDialog
        open={showDiscardWarning}
        onOpenChange={setShowDiscardWarning}
        title="Discard changes?"
        description="You have unsaved changes. Do you want to discard them?"
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

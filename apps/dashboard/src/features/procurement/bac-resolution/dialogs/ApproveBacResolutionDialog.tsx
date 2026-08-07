import { useState } from 'react'
import { ApproveBacResolutionForm } from '../forms/ApproveBacResolutionForm'
import type { ApproveBacResolutionPayload } from '../types'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'

interface ApproveBacResolutionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bacResolutionId: string
  onApprove: (values: ApproveBacResolutionPayload) => Promise<void> | void
}

export function ApproveBacResolutionDialog({
  open,
  onOpenChange,
  bacResolutionId,
  onApprove,
}: ApproveBacResolutionDialogProps) {
  const [isDirty, setIsDirty] = useState(false)
  const [showDiscardWarning, setShowDiscardWarning] = useState(false)
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [pendingValues, setPendingValues] = useState<ApproveBacResolutionPayload | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isDirty) {
      setShowDiscardWarning(true)
      return
    }

    onOpenChange(nextOpen)
  }

  const handleSubmit = (values: ApproveBacResolutionPayload) => {
    setPendingValues(values)
    setShowApproveConfirm(true)
  }

  const handleConfirmApprove = async () => {
    if (pendingValues) {
      await onApprove(pendingValues)
      setShowApproveConfirm(false)
      setPendingValues(null)
    }
  }

  const formId = 'approve-bac-resolution-form'

  return (
    <>
      <ResponsiveDialogDashtail
        open={open && !showDiscardWarning && !showApproveConfirm}
        onOpenChange={handleOpenChange}
        title="Approve BAC Resolution"
        description="Upload the physically signed BAC Resolution before approving it."
        size="lg"
        showCloseButton
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={false}
            >
              Cancel
            </Button>
            <Button form={formId} type="submit">
              Approve
            </Button>
          </div>
        }
      >
        <ApproveBacResolutionForm
          formId={formId}
          bacResolutionId={bacResolutionId}
          onSubmit={handleSubmit}
          onDirtyChange={setIsDirty}
        />
      </ResponsiveDialogDashtail>

      <ConfirmAlertDialog
        open={showApproveConfirm}
        onOpenChange={setShowApproveConfirm}
        title="Approve BAC Resolution?"
        description="Are you sure you want to approve this BAC Resolution?"
        confirmLabel="Approve"
        cancelLabel="Cancel"
        onConfirm={handleConfirmApprove}
        onCancel={() => {
          setShowApproveConfirm(false)
          setPendingValues(null)
        }}
      />

      <ConfirmAlertDialog
        open={showDiscardWarning}
        onOpenChange={setShowDiscardWarning}
        title="Discard signed document?"
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

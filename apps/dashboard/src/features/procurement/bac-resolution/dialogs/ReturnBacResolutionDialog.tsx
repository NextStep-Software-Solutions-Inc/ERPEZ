import { useState } from 'react'
import { ReturnBacResolutionForm } from '../forms/ReturnBacResolutionForm'
import type { ReturnBacResolutionPayload } from '../types'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'

interface ReturnBacResolutionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bacResolutionId: string
  onReturn: (values: ReturnBacResolutionPayload) => Promise<void> | void
}

export function ReturnBacResolutionDialog({
  open,
  onOpenChange,
  bacResolutionId,
  onReturn,
}: ReturnBacResolutionDialogProps) {
  const [isDirty, setIsDirty] = useState(false)
  const [showDiscardWarning, setShowDiscardWarning] = useState(false)
  const [showReturnConfirm, setShowReturnConfirm] = useState(false)
  const [pendingValues, setPendingValues] = useState<ReturnBacResolutionPayload | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isDirty) {
      setShowDiscardWarning(true)
      return
    }

    onOpenChange(nextOpen)
  }

  const handleSubmit = (values: ReturnBacResolutionPayload) => {
    setPendingValues(values)
    setShowReturnConfirm(true)
  }

  const handleConfirmReturn = async () => {
    if (pendingValues) {
      await onReturn(pendingValues)
      setShowReturnConfirm(false)
      setPendingValues(null)
    }
  }

  const formId = 'return-bac-resolution-form'

  return (
    <>
      <ResponsiveDialogDashtail
        open={open && !showDiscardWarning && !showReturnConfirm}
        onOpenChange={handleOpenChange}
        title="Return BAC Resolution"
        description="Provide a reason so the procurement staff can correct the record."
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
              Return
            </Button>
          </div>
        }
      >
        <ReturnBacResolutionForm
          formId={formId}
          bacResolutionId={bacResolutionId}
          onSubmit={handleSubmit}
          onDirtyChange={setIsDirty}
        />
      </ResponsiveDialogDashtail>

      <ConfirmAlertDialog
        open={showReturnConfirm}
        onOpenChange={setShowReturnConfirm}
        title="Return BAC Resolution?"
        description="Are you sure you want to return this BAC Resolution for revision?"
        confirmLabel="Return"
        cancelLabel="Cancel"
        onConfirm={handleConfirmReturn}
        onCancel={() => {
          setShowReturnConfirm(false)
          setPendingValues(null)
        }}
      />

      <ConfirmAlertDialog
        open={showDiscardWarning}
        onOpenChange={setShowDiscardWarning}
        title="Discard return reason?"
        description="You have an unsaved return reason. Do you want to discard it?"
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

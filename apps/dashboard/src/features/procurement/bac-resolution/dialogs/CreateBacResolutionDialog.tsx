import { useState } from 'react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import type { CreateBacResolutionPayload } from '../types'
import { CreateBacResolutionForm } from '../forms/CreateBacResolutionForm'

interface CreateBacResolutionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (values: CreateBacResolutionPayload) => Promise<void> | void
}

export function CreateBacResolutionDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateBacResolutionDialogProps) {
  const [isDirty, setIsDirty] = useState(false)
  const [showDiscardWarning, setShowDiscardWarning] = useState(false)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isDirty) {
      setShowDiscardWarning(true)
      return
    }

    onOpenChange(nextOpen)
  }

  const formId = 'create-bac-resolution-form'

  return (
    <>
      <ResponsiveDialogDashtail
        open={open && !showDiscardWarning}
        onOpenChange={handleOpenChange}
        title="Create BAC Resolution"
        description="Start a new BAC Resolution draft before linking approved Consolidated PRs."
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
              Create
            </Button>
          </div>
        }
      >
        <CreateBacResolutionForm
          formId={formId}
          onSubmit={onCreate}
          onCancel={() => handleOpenChange(false)}
          onDirtyChange={setIsDirty}
        />
      </ResponsiveDialogDashtail>

      <ConfirmAlertDialog
        open={showDiscardWarning}
        onOpenChange={setShowDiscardWarning}
        title="Discard draft?"
        description="You have unsaved BAC Resolution draft data. Do you want to discard it?"
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

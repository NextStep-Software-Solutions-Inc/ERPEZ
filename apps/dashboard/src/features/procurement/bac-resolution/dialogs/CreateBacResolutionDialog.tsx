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
        description="Create a new BAC Resolution originating from an approved APP Item or Consolidated PR."
        size="xl"
        showCloseButton
        footer={
          <div className="flex justify-between items-center w-full">
            <span className="text-xs text-muted-foreground">
              Step 3 allows submitting the draft after reviewing procurement context.
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button form={formId} type="submit">
                Create BAC Resolution
              </Button>
            </div>
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

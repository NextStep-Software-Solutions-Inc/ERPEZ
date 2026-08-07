import { useState, useEffect } from 'react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import type { CreateBacResolutionPayload, BacResolution } from '../types'
import { CreateBacResolutionForm } from '../forms/CreateBacResolutionForm'

interface EditBacResolutionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resolution?: BacResolution
  onUpdate: (id: string, values: CreateBacResolutionPayload) => Promise<void> | void
}

export function EditBacResolutionDialog({
  open,
  onOpenChange,
  resolution,
  onUpdate,
}: EditBacResolutionDialogProps) {
  const [isDirty, setIsDirty] = useState(false)
  const [showDiscardWarning, setShowDiscardWarning] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [pendingValues, setPendingValues] = useState<CreateBacResolutionPayload | null>(null)

  // Reset dirty status on open change
  useEffect(() => {
    if (open) {
      setIsDirty(false)
      setShowSaveConfirm(false)
      setPendingValues(null)
    }
  }, [open])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isDirty) {
      setShowDiscardWarning(true)
      return
    }

    onOpenChange(nextOpen)
  }

  const handleSubmit = (values: CreateBacResolutionPayload) => {
    setPendingValues(values)
    setShowSaveConfirm(true)
  }

  const handleConfirmSave = async () => {
    if (pendingValues && resolution) {
      await onUpdate(resolution.id, pendingValues)
      setShowSaveConfirm(false)
      setPendingValues(null)
    }
  }

  const formId = 'edit-bac-resolution-form'

  if (!resolution) return null

  // Map BacResolution back to the edit payload fields
  const initialValues: Partial<CreateBacResolutionPayload> = {
    title: resolution.description || '',
    abc: resolution.totalAmount || 0,
    resolutionType: 'Standard', // Default type
    bacResolutionNumber: resolution.bacResolutionNumber,
    resolutionDate: resolution.resolutionDate,
    description: resolution.description,
    resolvedDateText: resolution.resolvedDateText,
    resolvedLocationText: resolution.resolvedLocationText,
    whereasClauses: resolution.whereasClauses,
    provisionalMembers: resolution.provisionalMembers,
    signatoryOverrides: resolution.signatoryOverrides,
  }

  return (
    <>
      <ResponsiveDialogDashtail
        open={open && !showDiscardWarning && !showSaveConfirm}
        onOpenChange={handleOpenChange}
        title="Edit BAC Resolution"
        description="Update the BAC Resolution draft details."
        size="lg"
        showCloseButton
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button form={formId} type="submit">
              Save Changes
            </Button>
          </div>
        }
      >
        <CreateBacResolutionForm
          formId={formId}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={() => handleOpenChange(false)}
          onDirtyChange={setIsDirty}
        />
      </ResponsiveDialogDashtail>

      <ConfirmAlertDialog
        open={showSaveConfirm}
        onOpenChange={setShowSaveConfirm}
        title="Confirm Save Changes?"
        description="Are you sure you want to update this BAC Resolution draft?"
        confirmLabel="Save"
        cancelLabel="Cancel"
        onConfirm={handleConfirmSave}
        onCancel={() => {
          setShowSaveConfirm(false)
          setPendingValues(null)
        }}
      />

      <ConfirmAlertDialog
        open={showDiscardWarning}
        onOpenChange={setShowDiscardWarning}
        title="Discard changes?"
        description="You have unsaved edits. Do you want to discard them?"
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

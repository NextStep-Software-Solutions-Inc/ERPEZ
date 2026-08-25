import { useState, useEffect, useRef } from 'react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import type { BacResolution, BacProject } from '../types'
import {
  CreateBacResolutionForm,
  type CreateBacResolutionWizardRef,
} from '../forms/CreateBacResolutionForm'
import { CreateBacResolutionPayload } from '../handlers/createBacResolutionRequest'

interface EditBacResolutionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resolution?: BacProject
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
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(3)
  const wizardRef = useRef<CreateBacResolutionWizardRef>(null)

  // Reset dirty status on open change
  useEffect(() => {
    if (open) {
      setIsDirty(false)
      setShowSaveConfirm(false)
      setPendingValues(null)
      setCurrentStep(3)
    }
  }, [open])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isDirty) {
      setShowDiscardWarning(true)
      return
    }

    onOpenChange(nextOpen)
  }

  const handleSubmitForm = (values: CreateBacResolutionPayload) => {
    setPendingValues(values)
    setShowSaveConfirm(true)
  }

  const handleSaveClick = async () => {
    if (wizardRef.current) {
      await wizardRef.current.submit()
    }
  }

  const handleConfirmSave = async () => {
    if (pendingValues && resolution) {
      await onUpdate(resolution.id, pendingValues)
      setShowSaveConfirm(false)
      setPendingValues(null)
      onOpenChange(false)
    }
  }

  if (!resolution) return null

  // Map BacProject or BacResolution back to edit form payload fields
  const initialValues: Partial<CreateBacResolutionPayload> = {
    title: resolution.title,
    resolutionType: resolution.resolutionType,
    resolutionNumber: resolution.resolutionNumber,
    dateResolved: resolution.dateResolved,
    resolvedLocation: resolution.resolvedLocation,
    whereasClauses: (resolution). || [],
    endUserRepresentativeId: (resolution as any).endUserRepresentativeId || null,
    techRepresentativeId: (resolution as any).techRepresentativeId || null,
  }

  return (
    <>
      <ResponsiveDialogDashtail
        open={open && !showDiscardWarning && !showSaveConfirm}
        onOpenChange={handleOpenChange}
        title="Edit BAC Resolution"
        description="Update the BAC Resolution draft details."
        size="4xl"
        showCloseButton
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveClick}>
              Save Changes
            </Button>
          </div>
        }
      >
        <CreateBacResolutionForm
          ref={wizardRef}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          initialValues={initialValues}
          onSubmit={handleSubmitForm}
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


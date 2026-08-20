import { useState } from 'react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import type { CreateBacResolutionPayload } from '../handlers/createBacResolutionRequest'
import { CreateBacResolutionForm } from '../forms/CreateBacResolutionForm'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [canProceed, setCanProceed] = useState(false)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isDirty) {
      setShowDiscardWarning(true)
      return
    }

    if (!nextOpen) {
      setCurrentStep(1)
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
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setCurrentStep((prev) => (prev - 1) as 1 | 2)
                  }
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {currentStep === 1 && (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!canProceed}
                  className="gap-1"
                >
                  Next: Pick Source Record
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}

              {currentStep === 2 && (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={!canProceed}
                  className="gap-1"
                >
                  Next: BAC Details
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}

              {currentStep === 3 && (
                <Button form={formId} type="submit">
                  Create BAC Resolution
                </Button>
              )}
            </div>
          </div>
        }
      >
        <CreateBacResolutionForm
          formId={formId}
          onSubmit={async (values) => {
            await onCreate(values)
            setCurrentStep(1)
            onOpenChange(false)
          }}
          onCancel={() => handleOpenChange(false)}
          onDirtyChange={setIsDirty}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          onCanProceedChange={setCanProceed}
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
          setCurrentStep(1)
          onOpenChange(false)
        }}
      />
    </>
  )
}

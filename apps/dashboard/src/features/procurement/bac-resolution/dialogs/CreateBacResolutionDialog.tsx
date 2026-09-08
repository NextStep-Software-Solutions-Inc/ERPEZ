import { useState, useRef, useEffect } from 'react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { toast } from 'sonner'
import { createBacResolutionRequest, type CreateBacResolutionPayload } from '../handlers/createBacResolutionRequest'
import {
  CreateBacResolutionForm,
  type CreateBacResolutionWizardRef,
} from '../forms/CreateBacResolutionForm'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'

interface CreateBacResolutionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void

}
const useCreateBacResolution = createMutationHookFromTemplate(createBacResolutionRequest)
export function CreateBacResolutionDialog({
  open,
  onOpenChange,
}: CreateBacResolutionDialogProps) {
  const queryClient = useQueryClient()
  const [isDirty, setIsDirty] = useState(false)
  const [showDiscardWarning, setShowDiscardWarning] = useState(false)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const wizardRefActual = useRef<CreateBacResolutionWizardRef>(null)
  const { mutateAsync } = useCreateBacResolution()

  useEffect(() => {
    if (open) {
      setCurrentStep(1)
      setIsSubmitting(false)
    }
  }, [open])

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

  const handleNextStep = async () => {
    if (wizardRefActual.current) {
      await wizardRefActual.current.nextStep()
    }
  }

  const handleBackStep = () => {
    if (wizardRefActual.current) {
      wizardRefActual.current.backStep()
    }
  }

  const handleSubmit = async (values: CreateBacResolutionPayload) => {
    try {
      setIsSubmitting(true)
      await toast.promise(
        mutateAsync({
          pathParams: {},
          payload: values,
        }, {
          onSuccess: async () => {
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                query.queryKey[0].startsWith('/bac/projects'),
            })
          }
        }),
        {
          loading: 'Creating BAC Resolution...',
          success: 'BAC Resolution created successfully!',
          error: (err) =>
            err instanceof Error ? err.message : 'Failed to create BAC Resolution.',
        },
      )
      onOpenChange(false)
    } catch {
      // toast.promise handles presentation
    } finally {
      setIsSubmitting(false)
    }
  }

  const footer = (
    <div className="flex justify-between items-center w-full">
      <Button
        type="button"
        variant="outline"
        onClick={handleBackStep}
        disabled={currentStep === 1 || isSubmitting}
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => handleOpenChange(false)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        {currentStep < 3 ? (
          <Button
            type="button"
            onClick={handleNextStep}
            disabled={isSubmitting}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => wizardRefActual.current?.submit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create BAC Resolution'}
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <>
      <ResponsiveDialogDashtail
        open={open && !showDiscardWarning}
        onOpenChange={handleOpenChange}
        title="Create BAC Resolution"
        description="Create a new BAC Resolution originating from an approved APP Item or Consolidated PR."
        size="4xl"
        showCloseButton
        footer={footer}
      >
        <CreateBacResolutionForm
          ref={wizardRefActual}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onSubmit={handleSubmit}
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
          setCurrentStep(1)
          onOpenChange(false)
        }}
      />
    </>
  )
}



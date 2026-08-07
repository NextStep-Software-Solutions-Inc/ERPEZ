import {  useCallback, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Alert, AlertDescription } from './ui/alert'
import type {ReactNode} from 'react';
import { Button } from '@/components/ui/button'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { cn } from '@/lib/utils'

// TanStack Form error types
interface FieldError {
  message: string
  code?: string
  [key: string]: unknown
}

interface FormErrors {
  [key: string]: FieldError | FormErrors | Array<FieldError> | Array<FormErrors>
}

export interface MultiStepFormStep<TFormValues> {
  title: string
  content: ReactNode
  canProceed: (values: TFormValues) => boolean
}

// Generic form interface for flexibility with different form libraries
export interface MultiStepFormApi<TFormValues> {
  state: {
    values: TFormValues
    isDirty: boolean
    errors?: FormErrors
  }
  reset: () => void
  handleSubmit: () => void
}

export interface MultiStepFormProps<TFormValues> {
  steps: Array<MultiStepFormStep<TFormValues>>
  form: MultiStepFormApi<TFormValues>
  currentStep: number
  onStepChange: (step: number) => void
  onSubmit: () => void
  onCancel: () => void
  submitButtonText: string
  submitIcon?: ReactNode
  isLoading?: boolean
  className?: string
  onClearPersistence?: () => void
}

export default function MultiStepForm<TFormValues>({
  steps,
  form,
  currentStep,
  onStepChange,
  onSubmit,
  onCancel,
  submitButtonText,
  submitIcon,
  isLoading = false,
  className,
  onClearPersistence,
}: MultiStepFormProps<TFormValues>) {
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)

  const totalSteps = steps.length
  const currentStepData = steps[currentStep - 1]
  const formValues = form.state.values

  const canProceed = useMemo(
    () => currentStepData?.canProceed(formValues) ?? false,
    [currentStepData, formValues],
  )

  const handleCancelAttempt = useCallback(() => {
    if (form.state.isDirty) {
      setShowUnsavedWarning(true)
    } else {
      handleConfirmCancel()
    }
  }, [form.state.isDirty])

  const handleConfirmCancel = useCallback(() => {
    form.reset()
    onClearPersistence?.()
    setShowUnsavedWarning(false)
    onCancel()
  }, [form, onCancel, onClearPersistence])

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps && canProceed) {
      onStepChange(currentStep + 1)
    }
  }, [currentStep, totalSteps, canProceed, onStepChange])

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1)
    }
  }, [currentStep, onStepChange])

  const formatFormErrors = useCallback(
    (errors: FormErrors | undefined): Array<string> => {
      if (!errors || typeof errors !== 'object') return []

      const errorMessages: Array<string> = []

      const processErrors = (
        obj: FormErrors | FieldError | unknown,
        path: Array<string> = [],
      ): void => {
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
              processErrors(item, [...path, index.toString()])
            } else if (typeof item === 'string') {
              errorMessages.push(`${path.join('.')}[${index}]: ${item}`)
            }
          })
        } else if (typeof obj === 'object' && obj !== null) {
          Object.entries(obj).forEach(([key, value]) => {
            if (
              typeof value === 'object' &&
              value !== null &&
              'message' in value &&
              typeof value.message === 'string'
            ) {
              // TanStack Form error object
              errorMessages.push(
                `${path.concat(key).join('.')}: ${value.message}`,
              )
            } else {
              processErrors(value, [...path, key])
            }
          })
        }
      }

      processErrors(errors)
      return errorMessages
    },
    [],
  )

  const formErrors = formatFormErrors(form.state.errors)
  return (
    <>
      <form
        className={cn(
          'flex flex-col min-h-[calc(100vh-15rem)] space-y-6',
          className,
        )}
      >
        {/* Step indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">
              {currentStepData?.title}
            </span>
          </div>
          <div className="text-sm font-medium">
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Form content */}
        <div className="space-y-4 flex-1 overflow-y-auto">
          {currentStepData?.content}
        </div>

        {formErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Please fix the following errors:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {formErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
        {/* Form buttons */}
        <div className="sticky bottom-0 left-0 right-0 flex justify-between gap-2 pt-4 border-t bg-white">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelAttempt}
              disabled={isLoading}
            >
              Cancel
            </Button>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={isLoading}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isLoading || !canProceed}
                className="bg-(--button-green)"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={onSubmit}
                disabled={isLoading}
                className="bg-(--button-green)"
              >
                {submitIcon}
                {submitButtonText}
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Unsaved changes warning */}
      <ConfirmAlertDialog
        open={showUnsavedWarning}
        onOpenChange={setShowUnsavedWarning}
        title="Unsaved Changes"
        description="You have unsaved changes that will be lost. Are you sure you want to continue?"
        onConfirm={handleConfirmCancel}
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
      />
    </>
  )
}

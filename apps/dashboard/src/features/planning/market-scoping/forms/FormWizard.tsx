/**
 * Market Scoping Form Wizard Container
 * Manages multi-step form flow and state
 * Location: src/features/planning/market-scoping/forms/
 */

import { useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { AlertCircle, BookOpen } from 'lucide-react'
import {
  draftMarketScopingAtom,
  currentFormStepAtom,
  isFormSavingAtom,
  marketScopingGuideOpenAtom,
} from '../atoms/marketScopingStateAtom'
import { ProjectOverviewForm } from './ProjectOverviewForm'
import { ActivitiesConductedForm } from './ActivitiesConductedForm'
import { ParameterEvaluationForm } from './ParameterEvaluationForm'
import { ReviewSubmitForm } from './ReviewSubmitForm'
import type { MarketScopingForm } from '../types/marketScopingTypes'
import type { ProjectOverviewFormData } from '../utils/validationRules'
import type { ActivityEvidence } from '../types/marketScopingTypes'
import type { ParameterEvaluation } from '../types/marketScopingTypes'

interface FormWizardProps {
  onFormSubmit: (formData: MarketScopingForm) => Promise<void>
  userProfile?: {
    readonly name: string
    readonly designation: string
    readonly departmentUnit: string
    readonly agencyName: string
  }
  libActivities?: readonly { readonly id: string; readonly name: string; readonly budget: number }[]
  onCancel: () => void
}

export function FormWizard({
  onFormSubmit,
  userProfile,
  libActivities,
  onCancel,
}: FormWizardProps) {
  const [currentStep, setCurrentStep] = useAtom(currentFormStepAtom)
  const [draft, setDraft] = useAtom(draftMarketScopingAtom)
  const [isSubmitting, setIsSubmitting] = useAtom(isFormSavingAtom)
  const [localError, setLocalError] = useState<string | null>(null)
  const setGuideOpen = useSetAtom(marketScopingGuideOpenAtom)

  const handleProjectOverviewNext = (data: ProjectOverviewFormData) => {
    setDraft((prev) => ({
      ...(prev ?? {}),
      ...data,
    }))
    setCurrentStep(2)
    window.scrollTo(0, 0)
  }

  const handleActivitiesNext = (activities: ActivityEvidence[]) => {
    setDraft((prev) => ({
      ...(prev ?? {}),
      activities,
    }))
    setCurrentStep(3)
    window.scrollTo(0, 0)
  }

  const handleParametersNext = (parameters: ParameterEvaluation[]) => {
    setDraft((prev) => ({
      ...(prev ?? {}),
      parameters,
    }))
    setCurrentStep(4)
    window.scrollTo(0, 0)
  }

  const handleSubmit = async (_comments?: string) => {
    if (!draft) {
      setLocalError('Form data not found')
      return
    }

    setIsSubmitting(true)
    setLocalError(null)

    try {
      const formData: MarketScopingForm = {
        id: draft.id || `temp-${Date.now()}`,
        ...draft,
        status: 'PendingApproval',
        createdDate: draft.createdDate || new Date(),
      } as MarketScopingForm

      await onFormSubmit(formData)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to submit form'
      setLocalError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!draft) {
      setLocalError('Form data not found')
      return
    }

    setIsSubmitting(true)
    setLocalError(null)

    try {
      const formData: MarketScopingForm = {
        id: draft.id || `temp-${Date.now()}`,
        ...draft,
        status: 'Draft',
        createdDate: draft.createdDate || new Date(),
      } as MarketScopingForm

      await onFormSubmit(formData)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save draft'
      setLocalError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
    window.scrollTo(0, 0)
  }

  const progressPercentage = (currentStep / 4) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-4">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <p className="text-lg text-muted-foreground font-semibold">
            Step {currentStep} of 4: {getStepTitle(currentStep)}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGuideOpen(true)}
            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700 gap-1.5 font-bold h-8 text-xs shrink-0 bg-white"
          >
            <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
            Scoping Guidelines
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between mt-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex flex-col items-center ${
                  step <= currentStep ? 'opacity-100' : 'opacity-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${
                    step < currentStep
                      ? 'bg-green-500 text-white'
                      : step === currentStep
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step < currentStep ? '✓' : step}
                </div>
                <span className="text-xs mt-2 text-center text-gray-600 max-w-20">
                  {getStepTitle(step)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {localError && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-800 mt-1">{localError}</p>
            </div>
          </div>
        )}

        {/* Form Steps */}
        <div>
          {currentStep === 1 && (
            <ProjectOverviewForm
              userProfile={userProfile}
              libActivities={libActivities}
              onNext={handleProjectOverviewNext}
            />
          )}

          {currentStep === 2 && (
            <ActivitiesConductedForm
              onNext={handleActivitiesNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 3 && (
            <ParameterEvaluationForm
              onNext={handleParametersNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 4 && (
            <ReviewSubmitForm
              onPrevious={handlePrevious}
              onSubmit={handleSubmit}
              onSaveDraft={handleSaveDraft}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        {/* Cancel Button (Always Available) */}
        <div className="text-center mt-8">
          <button
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-900 text-sm underline"
          >
            Cancel and return to dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

function getStepTitle(step: number): string {
  const titles = {
    1: 'Project Overview',
    2: 'Activities',
    3: 'Parameters',
    4: 'Review',
  }
  return titles[step as keyof typeof titles] || ''
}

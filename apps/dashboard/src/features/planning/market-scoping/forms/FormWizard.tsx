/**
 * Market Scoping Form Wizard Container
 * Manages multi-step form flow and state
 * Location: src/features/planning/market-scoping/forms/
 */

import { useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { toast } from 'sonner'
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
  libActivities?: readonly {
    readonly id: string
    readonly name: string
    readonly budget: number
  }[]
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
        userId: draft.userId || '',
        projectName: draft.projectName || '',
        estimatedBudget: draft.estimatedBudget || 0,
        periodFrom: draft.periodFrom || '',
        periodTo: draft.periodTo || '',
        expectedDeliveryDate: draft.expectedDeliveryDate || '',
        agencyName: draft.agencyName || '',
        departmentUnit: draft.departmentUnit || '',
        representativeName: draft.representativeName || '',
        representativeDesignation: draft.representativeDesignation || '',
        activities: draft.activities || [],
        parameters: draft.parameters || [],
        approvalRouting: draft.approvalRouting || [],
        createdBy: draft.createdBy || '',
        createdDate: draft.createdDate || new Date(),
        ...draft,
        status: 'PendingApproval',
      }

      await onFormSubmit(formData)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to submit form'
      setLocalError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = async (overrideData?: Partial<MarketScopingForm>) => {
    const effectiveDraft = {
      ...(draft ?? {}),
      ...(overrideData ?? {}),
    }

    setDraft(effectiveDraft)
    setIsSubmitting(true)
    setLocalError(null)

    try {
      const formData: MarketScopingForm = {
        id: effectiveDraft.id || `temp-${Date.now()}`,
        userId: effectiveDraft.userId || '',
        projectName: effectiveDraft.projectName || '',
        estimatedBudget: effectiveDraft.estimatedBudget || 0,
        periodFrom: effectiveDraft.periodFrom || '',
        periodTo: effectiveDraft.periodTo || '',
        expectedDeliveryDate: effectiveDraft.expectedDeliveryDate || '',
        agencyName: effectiveDraft.agencyName || '',
        departmentUnit: effectiveDraft.departmentUnit || '',
        representativeName: effectiveDraft.representativeName || '',
        representativeDesignation:
          effectiveDraft.representativeDesignation || '',
        activities: effectiveDraft.activities || [],
        parameters: effectiveDraft.parameters || [],
        approvalRouting: effectiveDraft.approvalRouting || [],
        createdBy: effectiveDraft.createdBy || '',
        createdDate: effectiveDraft.createdDate || new Date(),
        ...effectiveDraft,
        status: 'Draft',
      }

      // Only attempt server sync if minimum required fields for backend validator are present
      const canSyncToServer =
        !!formData.projectName &&
        formData.projectName.trim().length >= 3 &&
        !!formData.estimatedBudget &&
        formData.estimatedBudget > 0 &&
        !!formData.periodFrom &&
        !!formData.periodTo

      if (canSyncToServer) {
        await onFormSubmit(formData)
      } else {
        toast.info('Draft saved locally', {
          description:
            'Your progress is safely stored on this device. Complete Project Overview (Step 1) when you want to sync this draft with the server.',
        })
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save draft'
      setLocalError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProjectOverviewSaveDraft = async (
    data: Partial<ProjectOverviewFormData>,
  ) => {
    await handleSaveDraft(data)
  }

  const handleActivitiesSaveDraft = async (activities: ActivityEvidence[]) => {
    await handleSaveDraft({ activities })
  }

  const handleParametersSaveDraft = async (
    parameters: ParameterEvaluation[],
  ) => {
    await handleSaveDraft({ parameters })
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSaveDraft()}
              disabled={isSubmitting}
              className="border-slate-300 hover:bg-slate-50 text-slate-700 font-medium h-8 text-xs bg-white"
            >
              Save as Draft
            </Button>
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
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between mt-2">
            {[1, 2, 3, 4].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => {
                  setCurrentStep(step)
                  window.scrollTo(0, 0)
                }}
                className={`flex flex-col items-center cursor-pointer transition-opacity hover:opacity-100 ${
                  step <= currentStep ? 'opacity-100' : 'opacity-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all ${
                    step < currentStep
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : step === currentStep
                        ? 'bg-primary text-white ring-2 ring-primary/30'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {step < currentStep ? '✓' : step}
                </div>
                <span className="text-xs mt-2 text-center text-gray-600 max-w-20">
                  {getStepTitle(step)}
                </span>
              </button>
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
              onSaveDraft={handleProjectOverviewSaveDraft}
            />
          )}

          {currentStep === 2 && (
            <ActivitiesConductedForm
              onNext={handleActivitiesNext}
              onPrevious={handlePrevious}
              onSaveDraft={handleActivitiesSaveDraft}
            />
          )}

          {currentStep === 3 && (
            <ParameterEvaluationForm
              onNext={handleParametersNext}
              onPrevious={handlePrevious}
              onSaveDraft={handleParametersSaveDraft}
            />
          )}

          {currentStep === 4 && (
            <ReviewSubmitForm
              onPrevious={handlePrevious}
              onSubmit={handleSubmit}
              onSaveDraft={() => handleSaveDraft()}
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

const stepTitles: Record<number, string> = {
  1: 'Project Overview',
  2: 'Activities',
  3: 'Parameters',
  4: 'Review',
}

function getStepTitle(step: number): string {
  return stepTitles[step] || ''
}

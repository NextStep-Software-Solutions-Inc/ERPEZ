import { useState } from 'react'
import { useAtom } from 'jotai'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { useQueryClient } from 'erpez-shared-lib'
import { useCreateLIB } from '@/features/planning/line-item-budgeting/line-item-budget/hooks/useCreateLIB'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import SubmitButton from '@/components/SubmitButton'
import CreateLineItemBudgetForm, {
  CreateLIBFormValues,
  SourceDocument,
  BudgetMode,
} from './CreateLineItemBudgetForm'
import {
  libDialogCanProceedToStep2Atom,
  libDialogCurrentStepAtom,
  libDialogSelectedDocumentAtom,
  type LibDialogStep,
} from '@/features/planning/line-item-budgeting/line-item-budget/atoms/libDialogAtoms'

const FORM_ID = 'create-lib-form'

export function CreateLineItemBudgetDialog() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [currentStep, setCurrentStep] = useAtom(libDialogCurrentStepAtom)
  const [selectedDocument, setSelectedDocument] = useAtom(
    libDialogSelectedDocumentAtom,
  )
  const [canProceedToStep2] = useAtom(libDialogCanProceedToStep2Atom)
  const queryClient = useQueryClient()
  const { mutateAsync } = useCreateLIB()

  const handleNext = () => {
    if (currentStep === 1 && canProceedToStep2) {
      setCurrentStep(2)
    }
  }

  const handlePrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    }
  }

  const handleReset = () => {
    setCurrentStep(1 as LibDialogStep)
    setSelectedDocument(null)
  }

  const handleCreateLIB = async (
    values: CreateLIBFormValues,
    selectedDoc: SourceDocument,
    budgetMode: BudgetMode,
  ) => {
    try {
      setIsSubmitting(true)

      // Bottom-up: use fundSourceId (submits proposal)
      // Top-down: use agencyMasterBudgetId (drafts from ceiling)
      const isBottomUp = budgetMode === 'bottom-up'
      
      await mutateAsync({
        pathParams: {},
        payload: {
          fiscalYearId: values.fiscalYearId,
          agencyMasterBudgetId: isBottomUp ? undefined : values.agencyMasterBudgetId || undefined,
          fundSourceId: isBottomUp ? values.fundSourceId || undefined : undefined,
          officeId: values.officeId,
          sourceType: selectedDoc.type,
          sourceId: selectedDoc.id,
          scope:
            values.scope ||
            (selectedDoc.type === 'OPCR' ? 'Activity' : 'Project'),
          level:
            values.level ||
            (selectedDoc.type === 'OPCR' ? 'Activity' : 'Project'),
          name: values.name,
          totalAmount: 0,
          parentLIBId: values.parentLIBId || undefined,
          consolidatedIntoLIBId: values.consolidatedIntoLIBId || undefined,
        },
      })

      const modeLabel =
        budgetMode === 'bottom-up'
          ? 'Budget Proposal submitted!'
          : 'Line Item Budget created from ceiling!'

      toast.success(modeLabel)
      void queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].startsWith('/libs'),
      })
      handleReset()
      setOpen(false)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create Line Item Budget'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          handleReset()
        }
        setOpen(newOpen)
      }}
      title="Create New Line-Item Budget"
      description="Initialize a new Line-Item Budget document"
      size="full"
      className="max-w-2xl"
      trigger={
        <Button
          className="gap-2 shadow-lg hover:shadow-xl transition-all duration-200 text-white"
          style={{
            background: `hsl(var(--primary))`,
            borderColor: `hsl(var(--primary))`,
          }}
          size="lg"
        >
          Create New LIB
        </Button>
      }
      footer={
        currentStep === 1 ? (
          // Step 1 Footer: Cancel and Next buttons
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleReset()
                setOpen(false)
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceedToStep2 || isSubmitting}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          // Step 2 Footer: Back and Create buttons
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={isSubmitting}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            <SubmitButton
              form={FORM_ID}
              type="submit"
              loading={isSubmitting}
              disabled={!selectedDocument || isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? 'Creating...' : 'Create LIB'}
            </SubmitButton>
          </div>
        )
      }
    >
      <CreateLineItemBudgetForm
        formId={FORM_ID}
        onSubmit={handleCreateLIB}
        isLoading={isSubmitting}
        currentStep={currentStep}
        selectedDocument={selectedDocument}
        onDocumentSelect={setSelectedDocument}
      />
    </ResponsiveDialogDashtail>
  )
}

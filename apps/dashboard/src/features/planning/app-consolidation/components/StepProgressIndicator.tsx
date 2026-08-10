type Step = 'select-fiscal-year' | 'app-metadata' | 'select-ppmp' | 'aggregation' | 'bac' | 'signatories' | 'review'

const STEP_LABELS: Record<Step, string> = {
  'select-fiscal-year': 'Fiscal Year',
  'app-metadata': 'Metadata',
  'select-ppmp': 'Select PPMP',
  aggregation: 'Aggregation',
  bac: 'BAC',
  signatories: 'Signatories',
  review: 'Review',
}

interface StepProgressIndicatorProps {
  stepOrder: Step[]
  currentStep: Step
  currentStepIndex: number
  isDialogDisabled: boolean
  onStepChange: (step: Step) => void
}

export function StepProgressIndicator({
  stepOrder,
  currentStep,
  currentStepIndex,
  isDialogDisabled,
  onStepChange,
}: StepProgressIndicatorProps) {
  return (
    <div className="mx-6 my-4 px-6 py-6 border border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-white hover:shadow-sm transition-shadow">
      {/* Step Progress Container */}
      <div className="flex items-center justify-between mb-4">
        {stepOrder.map((step, index) => {
          const stepIndex = stepOrder.indexOf(step)
          const isCompleted = stepIndex < currentStepIndex
          const isCurrent = step === currentStep
          
          return (
            <div key={step} className="flex flex-col items-center flex-1">
              {/* Step Number */}
              <button
                onClick={() => {
                  if (!isDialogDisabled && stepIndex <= currentStepIndex) {
                    onStepChange(step)
                  }
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all mb-2 ${
                  isCurrent
                    ? 'bg-primary text-white shadow-md'
                    : isCompleted
                      ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600'
                      : 'bg-gray-300 text-gray-600'
                }`}
                disabled={isDialogDisabled || stepIndex > currentStepIndex}
              >
                {stepIndex + 1}
              </button>
              
              {/* Progress Line (Hidden on last step) */}
              {index < stepOrder.length - 1 && (
                <div
                  className={`absolute mt-5 w-12 h-1 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  style={{
                    left: `calc(50% + 20px)`,
                    top: '27px',
                  }}
                />
              )}

              {/* Step Label */}
              <p
                className={`text-xs font-semibold text-center whitespace-nowrap ${
                  isCurrent ? 'text-primary' : 'text-gray-600'
                }`}
              >
                {STEP_LABELS[step]}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

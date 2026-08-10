interface DialogStepIndicatorProps {
  currentStep: number
  totalSteps: number
  stepName: string
  className?: string
}

/**
 * Step counter for multi-step dialogs
 * Shows current step and total steps with progress indicator
 */
export function DialogStepIndicator({
  currentStep,
  totalSteps,
  stepName,
  className = '',
}: DialogStepIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Progress bar */}
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Step info */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {stepName}
        </span>
        <span className="text-xs font-semibold text-gray-700">
          {currentStep} / {totalSteps}
        </span>
      </div>
    </div>
  )
}

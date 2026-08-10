import { CheckCircle2 } from 'lucide-react'

interface WorkflowStepBadgeProps {
  stepNumber: number
  isComplete: boolean
  label: string
  className?: string
}

/**
 * Step indicator badge for tab navigation
 * Shows step number and completion status with visual indicator
 */
export function WorkflowStepBadge({
  stepNumber,
  isComplete,
  label,
  className = '',
}: WorkflowStepBadgeProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold transition-all duration-200 ${
          isComplete
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-200 text-gray-600'
        }`}
      >
        {isComplete ? <CheckCircle2 className="w-4 h-4" /> : stepNumber}
      </div>
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </div>
  )
}

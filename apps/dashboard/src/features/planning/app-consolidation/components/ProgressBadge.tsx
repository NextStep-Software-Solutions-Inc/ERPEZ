import { useMemo } from 'react'

interface ProgressBadgeProps {
  itemsAdded: number
  bacConfigured: boolean
  signatoriesAdded: boolean
  className?: string
}

/**
 * Enhanced visual progress indicator badge showing APP workflow completion
 * Displays individual step status with icons and overall progress
 */
export function ProgressBadge({
  itemsAdded,
  bacConfigured,
  signatoriesAdded,
  className = '',
}: ProgressBadgeProps) {
  const { percentage, completedSteps, totalSteps } = useMemo(() => {
    const steps = [itemsAdded, bacConfigured, signatoriesAdded].filter(Boolean).length
    const total = 3
    return {
      percentage: Math.round((steps / total) * 100),
      completedSteps: steps,
      totalSteps: total,
    }
  }, [itemsAdded, bacConfigured, signatoriesAdded])

  const getProgressColor = () => {
    if (percentage === 0) return 'text-gray-400 from-gray-50 to-gray-100'
    if (percentage < 50) return 'text-orange-500 from-orange-50 to-orange-100'
    if (percentage < 100) return 'text-blue-500 from-blue-50 to-blue-100'
    return 'text-green-500 from-green-50 to-green-100'
  }

  const [colorClass, bgGradient] = getProgressColor().split(' ')

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r ${bgGradient} border border-white/40 backdrop-blur-sm ${className}`}>
      {/* Progress indicator with percentage */}
      <div className="flex items-center gap-2">
        <div className="relative w-10 h-10 flex items-center justify-center">
          {/* Progress ring background */}
          <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-gray-200"
            />
            {/* Progress ring foreground */}
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray={`${(percentage / 100) * 62.83} 62.83`}
              className={`${colorClass} transition-all duration-500`}
            />
          </svg>
          {/* Percentage text */}
          <span className={`absolute text-xs font-bold ${colorClass}`}>
            {percentage}%
          </span>
        </div>
      </div>

      {/* Overall status */}
      <div className="flex items-center gap-1.5 ml-1 pl-1.5 border-l border-white/30">
        <span className="text-xs font-semibold text-gray-700">
          {completedSteps}/{totalSteps}
        </span>
        <span className="text-xs text-gray-600">
          {percentage === 100 ? '✓ Complete' : 'In Progress'}
        </span>
      </div>
    </div>
  )
}

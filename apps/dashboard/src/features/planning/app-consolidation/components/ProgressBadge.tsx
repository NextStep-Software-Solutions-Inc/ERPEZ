import { useMemo } from 'react'

interface ProgressBadgeProps {
  itemsAdded: number
  bacConfigured: boolean
  signatoriesAdded: boolean
  status?: string
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
  status,
  className = '',
}: ProgressBadgeProps) {
  const { percentage, completedSteps, totalSteps } = useMemo(() => {
    const isPostDraft = status === 'Submitted' || status === 'Approved' || status === 'Locked'
    const total = 3
    if (isPostDraft) {
      return {
        percentage: 100,
        completedSteps: 3,
        totalSteps: 3,
      }
    }
    const hasItems = itemsAdded > 0
    const steps = [hasItems, bacConfigured, signatoriesAdded].filter(Boolean).length
    return {
      percentage: Math.round((steps / total) * 100),
      completedSteps: steps,
      totalSteps: total,
    }
  }, [itemsAdded, bacConfigured, signatoriesAdded, status])

  const getProgressStyles = () => {
    if (percentage === 0) {
      return {
        ringColor: 'text-slate-300',
        textColor: 'text-slate-500',
        badgeBg: 'bg-slate-50/80 border-slate-200/60',
      }
    }
    if (percentage < 50) {
      return {
        ringColor: 'text-amber-500/70',
        textColor: 'text-amber-700',
        badgeBg: 'bg-amber-50/40 border-amber-200/50',
      }
    }
    if (percentage < 100) {
      return {
        ringColor: 'text-blue-500/70',
        textColor: 'text-blue-700',
        badgeBg: 'bg-blue-50/40 border-blue-200/50',
      }
    }
    return {
      ringColor: 'text-emerald-500/70',
      textColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-50/30 border-emerald-200/50',
    }
  }

  const { ringColor, textColor, badgeBg } = getProgressStyles()

  return (
    <div className={`inline-flex items-center gap-2.5 px-3 py-1 rounded-md border ${badgeBg} ${className}`}>
      {/* Progress indicator with percentage */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="relative w-8 h-8 flex items-center justify-center">
          {/* Progress ring background */}
          <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
            <circle
              cx="16"
              cy="16"
              r="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-slate-200"
            />
            {/* Progress ring foreground */}
            <circle
              cx="16"
              cy="16"
              r="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${(percentage / 100) * 81.68} 81.68`}
              className={`${ringColor} transition-all duration-500`}
            />
          </svg>
          {/* Percentage text */}
          <span className="absolute text-[9px] font-semibold text-slate-700 tracking-tighter select-none">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Overall status */}
      <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200/70">
        <span className="text-xs font-medium text-slate-600">
          {completedSteps}/{totalSteps}
        </span>
        <span className={`text-xs ${percentage === 100 ? textColor : 'text-slate-500'} font-medium`}>
          {percentage === 100 ? '✓ Complete' : 'In Progress'}
        </span>
      </div>
    </div>
  )
}

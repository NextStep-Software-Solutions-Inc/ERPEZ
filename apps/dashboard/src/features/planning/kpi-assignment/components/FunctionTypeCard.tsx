/**
 * FunctionTypeCard Component
 * Displays KPI assignments grouped by function category
 * Design pattern: Matches FunctionTypeListPage's visual structure with icon, description, and metrics
 */

import { ArrowRight, Lock, Unlock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { FunctionTypeGroup } from '../types/grouping.types'
import { formatLockStatus } from '../utils/grouping'
import { FunctionCategory } from '@/features/planning/master-kpi/types'
import { getCategoryVisuals } from '@/pages/planning/commitments/utils/functions'

interface FunctionTypeCardProps {
  functionType: FunctionTypeGroup
  onClick?: () => void
  className?: string
}

/**
 * FunctionTypeCard - Displays aggregated KPI data by function category
 * Uses consistent visual design from getCategoryVisuals (icon, colors, typography)
 */
export const FunctionTypeCard = ({
  functionType,
  onClick,
  className = '',
}: FunctionTypeCardProps) => {
  // Type-safe category inference from string value
  const category = Object.values(FunctionCategory).includes(
    functionType.functionCategory as FunctionCategory,
  )
    ? (functionType.functionCategory as FunctionCategory)
    : FunctionCategory.CORE

  const visuals = getCategoryVisuals(category)
  const IconComponent = visuals.icon
  const hasLocked = functionType.lockedCount > 0
  const lockStatusText = formatLockStatus(
    functionType.lockedCount,
    functionType.assignmentCount,
  )

  return (
    <button
      onClick={onClick}
      className={`
        group relative h-auto overflow-hidden
        bg-card dark:bg-slate-900/65 border border-border rounded-xl p-6 text-left
        transition-all duration-200
        hover:shadow-md hover:border-primary/40 hover:bg-muted/40 dark:hover:bg-slate-800/75
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        w-full ${visuals.leftBorderColor}
        border-l-4
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
        ${className}
      `}
    >
      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-between w-full gap-6">
        {/* Left: Icon + Title + Subtitle */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Icon Container */}
          <div className={`p-3 rounded-xl shrink-0 ${visuals.iconBgColor}`}>
            <IconComponent className={`h-6 w-6 ${visuals.iconColor}`} />
          </div>

          {/* Title + Metrics */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary dark:group-hover:text-indigo-300 transition-colors">
              {visuals.title}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {visuals.description}
            </p>
          </div>
        </div>

        {/* Right: Metrics + Badge + Arrow */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Lock Status Indicator */}
          <div className="flex items-center gap-1.5 min-w-fit">
            {hasLocked ? (
              <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            ) : (
              <Unlock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <span
              className={`text-xs font-medium whitespace-nowrap ${
                hasLocked
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {lockStatusText}
            </span>
          </div>

          {/* KPI Count Badge */}
          <Badge
            variant="outline"
            className={`text-sm font-semibold px-3 py-1 whitespace-nowrap ${visuals.badgeBgColor} ${visuals.badgeTextColor} border ${visuals.badgeBorderColor}`}
          >
            {functionType.kpiCount} KPI{functionType.kpiCount !== 1 ? 's' : ''}
          </Badge>

          {/* Arrow Icon */}
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
        </div>
      </div>
    </button>
  )
}

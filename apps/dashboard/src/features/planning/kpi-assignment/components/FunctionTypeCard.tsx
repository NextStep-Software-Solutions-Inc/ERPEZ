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
        bg-white border border-gray-200 rounded-lg p-6 text-left
        transition-all duration-300
        hover:shadow-md hover:border-gray-300 hover:bg-gray-50
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
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
          <div className={`p-3 rounded-lg shrink-0 ${visuals.iconBgColor}`}>
            <IconComponent className={`h-6 w-6 ${visuals.iconColor}`} />
          </div>

          {/* Title + Metrics */}
          <div className="flex-1 min-w-0 space-y-2">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
              {visuals.title}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {visuals.description}
            </p>
          </div>
        </div>

        {/* Right: Metrics + Badge + Arrow */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Lock Status Indicator */}
          <div className="flex items-center gap-1.5 min-w-fit">
            {hasLocked ? (
              <Lock className="h-4 w-4 text-orange-600" />
            ) : (
              <Unlock className="h-4 w-4 text-green-600" />
            )}
            <span
              className={`text-xs font-medium whitespace-nowrap ${
                hasLocked ? 'text-orange-700' : 'text-green-700'
              }`}
            >
              {lockStatusText}
            </span>
          </div>

          {/* KPI Count Badge */}
          <Badge
            className={`text-sm font-semibold px-3 py-1 whitespace-nowrap ${visuals.badgeBgColor} ${visuals.badgeTextColor} border ${visuals.badgeBorderColor}`}
          >
            {functionType.kpiCount} KPI{functionType.kpiCount !== 1 ? 's' : ''}
          </Badge>

          {/* Arrow Icon */}
          <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-gray-400 transition-colors shrink-0" />
        </div>
      </div>
    </button>
  )
}

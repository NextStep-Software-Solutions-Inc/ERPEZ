/**
 * OfficeKpiCard Component
 * Displays KPI assignment summary for a specific office
 * Shows count, targets, KPI names, and lock status
 */

import { Lock, Unlock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { OfficeGroup } from '../types/grouping.types'
import { formatLockStatus } from '../utils/grouping'

interface OfficeKpiCardProps {
  office: OfficeGroup
  onClick?: () => void
  className?: string
}

export const OfficeKpiCard = ({
  office,
  onClick,
  className = '',
}: OfficeKpiCardProps) => {
  const hasLocked = office.lockedCount > 0
  const lockStatusText = formatLockStatus(
    office.lockedCount,
    office.assignmentCount,
  )

  const MAX_VISIBLE_KPIS = 2
  const visibleKpis = office.kpiNames.slice(0, MAX_VISIBLE_KPIS)
  const remainingCount = office.kpiNames.length - MAX_VISIBLE_KPIS

  const cardContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Header: Office Name + Count Badge */}
        <div className="flex items-start justify-between gap-3 mb-3 min-w-0 min-h-[2.75rem]">
          <div className="min-w-0 flex-1">
            <h3
              className="text-base font-bold text-gray-900 leading-snug line-clamp-2 break-words"
              title={office.name}
            >
              {office.name}
            </h3>
          </div>
          <Badge className="bg-primary-100 text-primary-700 font-semibold text-xs whitespace-nowrap shrink-0">
            {office.assignmentCount}
          </Badge>
        </div>

        {/* Lock Status Indicator */}
        <div className="mb-3.5 flex items-center gap-2">
          {hasLocked ? (
            <Lock className="h-4 w-4 text-orange-600 shrink-0" />
          ) : (
            <Unlock className="h-4 w-4 text-green-600 shrink-0" />
          )}
          <span
            className={`text-sm font-medium ${
              hasLocked ? 'text-orange-700' : 'text-green-700'
            }`}
          >
            {lockStatusText}
          </span>
        </div>

        {/* Aggregated Targets Section */}
        <div className="mb-4 bg-gray-50 rounded-lg p-3.5 border border-gray-100 min-w-0">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Aggregated Targets
          </p>
          <div className="grid grid-cols-2 gap-3 min-w-0">
            <div>
              <span className="text-xs text-gray-600">Annual</span>
              <p className="text-lg font-bold text-primary-600">
                {office.aggregatedTargets.annual}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-xs text-gray-600">Q1</span>
                <p className="text-sm font-semibold text-gray-700">
                  {office.aggregatedTargets.q1}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-600">Q2</span>
                <p className="text-sm font-semibold text-gray-700">
                  {office.aggregatedTargets.q2}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-600">Q3</span>
                <p className="text-sm font-semibold text-gray-700">
                  {office.aggregatedTargets.q3}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-600">Q4</span>
                <p className="text-sm font-semibold text-gray-700">
                  {office.aggregatedTargets.q4}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Names Preview */}
      <div className="min-w-0 mt-auto">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
          Assigned KPIs
        </p>
        <div className="min-w-0 min-h-[4.5rem] flex flex-col justify-start">
          {office.kpiNames.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              {visibleKpis.map((kpiName, idx) => (
                <Badge
                  key={idx}
                  title={kpiName}
                  className="bg-blue-50 text-blue-700 text-xs font-medium truncate max-w-full leading-tight py-1 px-2.5 h-auto inline-block text-left"
                >
                  {kpiName}
                </Badge>
              ))}
              {remainingCount > 0 && (
                <Badge
                  title={`${remainingCount} more assigned KPIs`}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium whitespace-nowrap shrink-0 py-1 px-2.5 inline-block"
                >
                  +{remainingCount} more
                </Badge>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic py-1">No KPIs assigned</p>
          )}
        </div>
      </div>
    </div>
  )

  const baseClasses = `bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-primary-300 transition-all duration-200 w-full h-full text-left overflow-hidden ${className}`

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2`}
      >
        {cardContent}
      </button>
    )
  }

  return <div className={baseClasses}>{cardContent}</div>
}

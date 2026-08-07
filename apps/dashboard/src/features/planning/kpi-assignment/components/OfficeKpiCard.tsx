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

  const cardContent = (
    <>
      {/* Header: Office Name + Count Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {office.name}
          </h3>
        </div>
        <Badge className="bg-primary-100 text-primary-700 font-semibold text-sm whitespace-nowrap">
          {office.assignmentCount}
        </Badge>
      </div>

      {/* Lock Status Indicator */}
      <div className="mb-4 flex items-center gap-2">
        {hasLocked ? (
          <Lock className="h-4 w-4 text-orange-600" />
        ) : (
          <Unlock className="h-4 w-4 text-green-600" />
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
      <div className="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
          Aggregated Targets
        </p>
        <div className="grid grid-cols-2 gap-3">
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

      {/* KPI Names Preview */}
      <div>
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
          Assigned KPIs
        </p>
        <div className="space-y-1">
          {office.kpiNames.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {office.kpiNames.slice(0, 3).map((kpiName, idx) => (
                <Badge
                  key={idx}
                  className="bg-blue-50 text-blue-700 text-xs font-medium"
                >
                  {kpiName}
                </Badge>
              ))}
              {office.kpiNames.length > 3 && (
                <Badge className="bg-gray-100 text-gray-700 text-xs font-medium">
                  +{office.kpiNames.length - 3} more
                </Badge>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No KPIs assigned</p>
          )}
        </div>
      </div>
    </>
  )

  const baseClasses = `bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-primary-300 transition-all duration-200 ${className}`

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2`}
      >
        {cardContent}
      </button>
    )
  }

  return <div className={baseClasses}>{cardContent}</div>
}

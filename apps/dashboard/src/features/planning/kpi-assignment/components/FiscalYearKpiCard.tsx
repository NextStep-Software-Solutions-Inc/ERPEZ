/**
 * FiscalYearKpiCard Component
 * Displays KPI assignment summary for a specific fiscal year (within a filtered office)
 * Shows KPI count, assignment count, targets, and lock status
 */

import { Lock, Unlock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { FYGroup } from '../types/grouping.types'
import { formatLockStatus } from '../utils/grouping'

interface FiscalYearKpiCardProps {
  fy: FYGroup
  onClick?: () => void
  className?: string
}

/**
 * Helper: Format fiscal year ID to readable format
 * Assumes format like "fy2024" or UUID - for now just display as is
 * TODO: Map to actual fiscal year names if available
 */
const formatFiscalYear = (fiscalYearId: string): string => {
  // If it looks like a UUID, show first 8 chars + "..."
  if (fiscalYearId.length > 20) {
    return `FY: ${fiscalYearId.substring(0, 8)}...`
  }
  // Otherwise show as is (e.g., "FY2024")
  return `FY: ${fiscalYearId}`
}


export const FiscalYearKpiCard = ({
  fy,
  onClick,
  className = '',
}: FiscalYearKpiCardProps) => {
  const hasLocked = fy.lockedCount > 0
  const lockStatusText = formatLockStatus(fy.lockedCount, fy.assignmentCount)

  const cardContent = (
    <>
      {/* Header: Fiscal Year + KPI Count Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-4">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {fy.year ? `FY: ${fy.year}` : formatFiscalYear(fy.fiscalYearId)}
            </h3>

          </div>
          {fy.description && (
            <p className="text-xs text-gray-500 line-clamp-1">{fy.description}</p>
          )}
        </div>
        <Badge className="bg-primary-100 text-primary-700 font-semibold text-sm whitespace-nowrap">
          {fy.kpiCount} KPI{fy.kpiCount !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Assignment Count */}
      <div className="mb-4 bg-blue-50 rounded-lg p-3 border border-blue-100">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
          Total Assignments
        </p>
        <p className="text-2xl font-bold text-blue-700">{fy.assignmentCount}</p>
      </div>

      {/* Lock Status Indicator */}
      <div className="mb-4 flex items-center gap-2">
        {hasLocked ? (
          <Lock className="h-4 w-4 text-orange-600" />
        ) : (
          <Unlock className="h-4 w-4 text-green-600" />
        )}
        <span
          className={`text-sm font-medium ${hasLocked ? 'text-orange-700' : 'text-green-700'
            }`}
        >
          {lockStatusText}
        </span>
      </div>

      {/* Aggregated Targets Section */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
          Targets Summary
        </p>
        <div className="grid grid-cols-5 gap-2">
          <div>
            <span className="text-xs text-gray-600">Annual</span>
            <p className="text-base font-bold text-primary-600">
              {fy.aggregatedTargets.annual}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-600">Q1</span>
            <p className="text-sm font-semibold text-gray-700">
              {fy.aggregatedTargets.q1}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-600">Q2</span>
            <p className="text-sm font-semibold text-gray-700">
              {fy.aggregatedTargets.q2}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-600">Q3</span>
            <p className="text-sm font-semibold text-gray-700">
              {fy.aggregatedTargets.q3}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-600">Q4</span>
            <p className="text-sm font-semibold text-gray-700">
              {fy.aggregatedTargets.q4}
            </p>
          </div>
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

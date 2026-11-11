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
            <h3 className="text-lg font-semibold text-foreground">
              {fy.year ? `FY: ${fy.year}` : formatFiscalYear(fy.fiscalYearId)}
            </h3>

          </div>
          {fy.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">{fy.description}</p>
          )}
        </div>
        <Badge className="bg-primary/10 text-primary dark:bg-indigo-500/20 dark:text-indigo-300 border border-primary/20 font-semibold text-sm whitespace-nowrap">
          {fy.kpiCount} KPI{fy.kpiCount !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Assignment Count */}
      <div className="mb-4 bg-blue-50 dark:bg-blue-500/15 rounded-lg p-3 border border-blue-100 dark:border-blue-500/30">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-300 uppercase tracking-wide">
          Total Assignments
        </p>
        <p className="text-2xl font-bold text-blue-700 dark:text-blue-200 tabular-nums">{fy.assignmentCount}</p>
      </div>

      {/* Lock Status Indicator */}
      <div className="mb-4 flex items-center gap-2">
        {hasLocked ? (
          <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        ) : (
          <Unlock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        )}
        <span
          className={`text-sm font-medium ${
            hasLocked
              ? 'text-amber-700 dark:text-amber-300'
              : 'text-emerald-700 dark:text-emerald-300'
          }`}
        >
          {lockStatusText}
        </span>
      </div>

      {/* Aggregated Targets Section */}
      <div className="bg-muted/40 dark:bg-slate-800/60 rounded-lg p-4 border border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Targets Summary
        </p>
        <div className="grid grid-cols-5 gap-2">
          <div>
            <span className="text-xs text-muted-foreground">Annual</span>
            <p className="text-base font-bold text-primary dark:text-indigo-400 tabular-nums">
              {fy.aggregatedTargets.annual}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Q1</span>
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {fy.aggregatedTargets.q1}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Q2</span>
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {fy.aggregatedTargets.q2}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Q3</span>
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {fy.aggregatedTargets.q3}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Q4</span>
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {fy.aggregatedTargets.q4}
            </p>
          </div>
        </div>
      </div>
    </>
  )

  const baseClasses = `bg-card dark:bg-slate-900/65 border border-border rounded-xl p-6 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-200 ${className}`

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

/**
 * APR Status Badge Component
 * Displays APR status with appropriate styling
 */

import { Badge } from '@/components/ui/badge'
import type { APRStatus } from '../types'
import { normalizeAPRStatus } from '../utils'

interface APRStatusBadgeProps {
  status: APRStatus | string
  size?: 'sm' | 'md' | 'lg'
  context?: 'user' | 'procurement_officer'
}

export function APRStatusBadge({
  status,
  size = 'md',
  context = 'user',
}: APRStatusBadgeProps) {
  const norm = normalizeAPRStatus(status)

  let label = String(status || 'Draft')
  let className =
    'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600'

  if (norm === 'DRAFT') {
    label = 'Draft'
    className =
      'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:border-slate-600'
  } else if (norm === 'FOR_APPROVAL') {
    label = context === 'procurement_officer' ? 'For Approval' : 'Submitted'
    className =
      'bg-blue-100 text-blue-800 hover:bg-blue-200/80 border-blue-300 dark:bg-blue-500/15 dark:text-blue-300 dark:hover:bg-blue-500/25 dark:border-blue-500/35'
  } else if (norm === 'RETURNED') {
    label = 'Returned'
    className =
      'bg-red-100 text-red-800 hover:bg-red-200/80 border-red-300 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/25 dark:border-red-500/35'
  } else if (norm === 'APPROVED') {
    label = 'Approved'
    className =
      'bg-emerald-100 text-emerald-800 hover:bg-emerald-200/80 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25 dark:border-emerald-500/35'
  } else if (norm === 'PARTIALLY_AVAILABLE') {
    label = 'Partially Available'
    className =
      'bg-amber-100 text-amber-800 hover:bg-amber-200/80 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25 dark:border-amber-500/35'
  } else if (norm === 'OUT_OF_STOCK') {
    label = 'Out of Stock'
    className =
      'bg-orange-100 text-orange-800 hover:bg-orange-200/80 border-orange-300 dark:bg-orange-500/15 dark:text-orange-300 dark:hover:bg-orange-500/25 dark:border-orange-500/35'
  }

  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  }[size]

  return (
    <Badge variant="outline" className={`${className} ${sizeClass} font-medium`}>
      {label}
    </Badge>
  )
}

/**
 * APR Status Badge Component
 * Displays APR status with appropriate styling
 */

import { Badge } from '@/components/ui/badge'
import type { APRStatus } from '../types'

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
  const key = String(status || 'DRAFT').toUpperCase().replace(/-/g, '_')

  let label = String(status || 'Draft')
  let className = 'bg-gray-100 text-gray-800 border-gray-300'

  if (key === 'DRAFT') {
    label = 'Draft'
    className = 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-300'
  } else if (key === 'SUBMITTED' || key === 'FOR_APPROVAL' || key === 'FORAPPROVAL') {
    label = context === 'procurement_officer' ? 'For Approval' : 'Submitted'
    className = 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300'
  } else if (key === 'RETURNED') {
    label = 'Returned'
    className = 'bg-red-100 text-red-800 hover:bg-red-200 border-red-300'
  } else if (key === 'APPROVED') {
    label = 'Approved'
    className = 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300'
  } else if (key === 'PARTIALLY_AVAILABLE' || key === 'PARTIALLYAVAILABLE') {
    label = 'Partially Available'
    className = 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300'
  } else if (key === 'OUT_OF_STOCK' || key === 'OUTOFSTOCK') {
    label = 'Out of Stock'
    className = 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300'
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

/**
 * APR Status Badge Component
 * Displays APR status with appropriate styling
 */

import { Badge } from '@/components/ui/badge'
import type { APRStatus } from '../types'

interface APRStatusBadgeProps {
  status: APRStatus | string
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-300',
  },
  FOR_APPROVAL: {
    label: 'For Review',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300',
  },
  FORAPPROVAL: {
    label: 'For Review',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300',
  },
  SUBMITTED: {
    label: 'For Review',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300',
  },
  RETURNED: {
    label: 'Returned',
    className: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-300',
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300',
  },
  PARTIALLY_AVAILABLE: {
    label: 'Partially Available',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300',
  },
  PARTIALLYAVAILABLE: {
    label: 'Partially Available',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300',
  },
  OUT_OF_STOCK: {
    label: 'Out of Stock',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300',
  },
  OUTOFSTOCK: {
    label: 'Out of Stock',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300',
  },
}

export function APRStatusBadge({
  status,
  size = 'md',
}: APRStatusBadgeProps) {
  const key = String(status || 'DRAFT').toUpperCase().replace(/-/g, '_')
  const config = statusConfig[key] || {
    label: String(status || 'Draft'),
    className: 'bg-gray-100 text-gray-800 border-gray-300',
  }

  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  }[size]

  return (
    <Badge variant="outline" className={`${config.className} ${sizeClass} font-medium`}>
      {config.label}
    </Badge>
  )
}

/**
 * Performance Review – Status Badge
 * Reusable badge aligned with Procurement Library badge patterns.
 */

import { Badge } from '@/components/ui/badge'
import { WORKFLOW_STATUS_COLORS, WORKFLOW_STATUS_LABELS, type WorkflowStatus } from '../types'

interface StatusBadgeProps {
  status: WorkflowStatus
  className?: string
}

export function WorkflowStatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium border ${WORKFLOW_STATUS_COLORS[status]} ${className ?? ''}`}
    >
      {WORKFLOW_STATUS_LABELS[status]}
    </Badge>
  )
}

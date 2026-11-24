import { Badge } from '@/components/ui/badge'
import type { MilestoneExecutionStatus } from '../types'

interface MilestoneExecutionStatusBadgeProps {
  status: MilestoneExecutionStatus
  className?: string
}

export function MilestoneExecutionStatusBadge({
  status,
  className,
}: MilestoneExecutionStatusBadgeProps) {
  switch (status) {
    case 'completed':
      return (
        <Badge variant="soft" color="success" className={className}>
          Completed
        </Badge>
      )
    case 'due-soon':
      return (
        <Badge variant="soft" color="warning" className={className}>
          Due Soon
        </Badge>
      )
    case 'overdue':
      return (
        <Badge variant="soft" color="destructive" className={className}>
          Overdue
        </Badge>
      )
    case 'pending':
    default:
      return (
        <Badge variant="soft" color="secondary" className={className}>
          Pending
        </Badge>
      )
  }
}

import { Badge } from '@/components/ui/badge'
import type { BiddingScheduleStatus } from '../types'

interface ScheduleStatusBadgeProps {
  status: BiddingScheduleStatus
  className?: string
}

export function ScheduleStatusBadge({
  status,
  className,
}: ScheduleStatusBadgeProps) {
  switch (status) {
    case 'confirmed':
      return (
        <Badge variant="soft" color="info" className={className}>
          Confirmed
        </Badge>
      )
    case 'locked':
      return (
        <Badge variant="soft" color="success" className={className}>
          Locked
        </Badge>
      )
    case 'draft':
    default:
      return (
        <Badge variant="soft" color="warning" className={className}>
          Draft
        </Badge>
      )
  }
}

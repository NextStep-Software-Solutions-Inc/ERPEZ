import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface BiddingMasterCalendarConflictBadgeProps {
  count: number
  compact?: boolean
}

export function BiddingMasterCalendarConflictBadge({
  count,
  compact = false,
}: BiddingMasterCalendarConflictBadgeProps) {
  return (
    <Badge
      variant="outline"
      color="warning"
      className={compact ? 'gap-1 px-2 py-0.5' : 'gap-1.5'}
    >
      <AlertTriangle className="h-3 w-3" />
      {compact ? count : `${count} conflict${count === 1 ? '' : 's'}`}
    </Badge>
  )
}

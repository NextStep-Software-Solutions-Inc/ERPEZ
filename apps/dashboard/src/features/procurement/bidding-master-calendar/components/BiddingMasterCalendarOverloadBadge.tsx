import { Layers3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface BiddingMasterCalendarOverloadBadgeProps {
  count: number
  compact?: boolean
}

export function BiddingMasterCalendarOverloadBadge({
  count,
  compact = false,
}: BiddingMasterCalendarOverloadBadgeProps) {
  return (
    <Badge
      variant="outline"
      color="info"
      className={compact ? 'gap-1 px-2 py-0.5' : 'gap-1.5'}
    >
      <Layers3 className="h-3 w-3" />
      {compact ? count : `${count} events`}
    </Badge>
  )
}

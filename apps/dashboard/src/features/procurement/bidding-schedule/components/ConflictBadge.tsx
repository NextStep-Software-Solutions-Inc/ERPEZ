import { AlertCircle, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { ConflictType } from '../types'

interface ConflictBadgeProps {
  type: ConflictType
  count?: number
  venue?: string
  className?: string
}

export function ConflictBadge({
  type,
  count,
  venue,
  className,
}: ConflictBadgeProps) {
  if (type === 'quorum') {
    return (
      <Badge
        variant="soft"
        color="destructive"
        className={`inline-flex items-center gap-1 font-medium ${className ?? ''}`}
      >
        <Users className="h-3 w-3" />
        <span>Quorum Conflict {count && count > 1 ? `(${count})` : ''}</span>
      </Badge>
    )
  }

  return (
    <Badge
      variant="soft"
      color="warning"
      className={`inline-flex items-center gap-1 font-medium ${className ?? ''}`}
    >
      <AlertCircle className="h-3 w-3" />
      <span>
        Venue Conflict{venue ? `: ${venue}` : ''}{' '}
        {count && count > 1 ? `(${count})` : ''}
      </span>
    </Badge>
  )
}

import { Badge } from '@/components/ui/badge'
import type { BacResolutionStatus } from '../types'


interface BacResolutionStatusBadgeProps {
  status?: BacResolutionStatus | string | null
}

const statusClasses: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  'for-approval': 'bg-amber-100 text-amber-800 border-amber-200',
  returned: 'bg-rose-100 text-rose-700 border-rose-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

function formatStatusLabel(status?: string | null) {
  if (!status) return 'Draft'
  return status
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function BacResolutionStatusBadge({
  status = 'draft',
}: BacResolutionStatusBadgeProps) {
  const currentStatus = status || 'draft'
  const badgeClass = statusClasses[currentStatus] || statusClasses.draft
  return (
    <Badge variant="outline" className={badgeClass}>
      {formatStatusLabel(currentStatus)}
    </Badge>
  )
}
